-- Additive migration. Back up the database first; existing articles/images are retained.
begin;
create table if not exists public.cms_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor','author')),
  display_name text not null, bio text not null default '', avatar_url text,
  created_at timestamptz not null default now()
);
create or replace function public.cms_role() returns text
language sql stable security definer set search_path = public
as $$ select role from public.cms_members where user_id = auth.uid() $$;
revoke all on function public.cms_role() from public;
grant execute on function public.cms_role() to anon, authenticated;
alter table public.cms_members enable row level security;
create policy cms_members_read on public.cms_members for select to authenticated using (public.cms_role() is not null);
create policy cms_members_admin on public.cms_members for all to authenticated
using (public.cms_role()='admin') with check (public.cms_role()='admin');

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, excerpt text not null default '', content text not null default '',
  author text not null, category text not null default 'General', tags text[] not null default '{}',
  image text, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.blog_posts
  add column if not exists status text not null default 'draft',
  add column if not exists author_id uuid references auth.users(id),
  add column if not exists editor_json jsonb,
  add column if not exists seo jsonb not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists image_alt text not null default '',
  add column if not exists image_width integer,
  add column if not exists image_height integer,
  add column if not exists image_srcset text,
  add column if not exists media_ids uuid[] not null default '{}';
update public.blog_posts set status='published', published_at=coalesce(published_at, created_at) where published;
alter table public.blog_posts add constraint blog_v2_status check(status in ('draft','in_review','scheduled','published','archived'));
create index if not exists blog_v2_public on public.blog_posts(status,published_at desc);
create index if not exists blog_v2_schedule on public.blog_posts(scheduled_at) where status='scheduled';

-- Existing policies can grant broad OR access: preserve their definitions before replacing them.
create table if not exists public.cms_policy_backup (captured_at timestamptz default now(), definition jsonb);
alter table public.cms_policy_backup enable row level security;
insert into public.cms_policy_backup(definition) select to_jsonb(p) from pg_policies p
where schemaname='public' and tablename='blog_posts';
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='blog_posts'
  loop execute format('drop policy %I on public.blog_posts',p.policyname); end loop;
end $$;
alter table public.blog_posts enable row level security;
create policy blog_public_read on public.blog_posts for select using (status='published' and published);
create policy blog_staff_read on public.blog_posts for select to authenticated using (
  public.cms_role() in ('admin','editor') or (public.cms_role()='author' and author_id=auth.uid()));
create policy blog_insert on public.blog_posts for insert to authenticated with check (
  public.cms_role() in ('admin','editor') or (public.cms_role()='author' and author_id=auth.uid() and status in ('draft','in_review')));
create policy blog_update on public.blog_posts for update to authenticated using (
  public.cms_role() in ('admin','editor') or (public.cms_role()='author' and author_id=auth.uid() and status in ('draft','in_review')))
with check (public.cms_role() in ('admin','editor') or (public.cms_role()='author' and author_id=auth.uid() and status in ('draft','in_review')));
create policy blog_delete on public.blog_posts for delete to authenticated using (public.cms_role() in ('admin','editor'));

create table public.blog_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);
create table public.blog_tags (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);
create table public.blog_revisions (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.blog_posts(id) on delete cascade,
  snapshot jsonb not null, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create index on public.blog_revisions(post_id,created_at desc);
create table public.blog_slug_redirects (
  old_slug text primary key, new_slug text not null, created_at timestamptz not null default now(), check(old_slug<>new_slug)
);
create table public.blog_media (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  name text not null, alt text not null, caption text not null default '',
  url text not null, storage_paths text[] not null, srcset text not null,
  width integer not null check(width>0), height integer not null check(height>0),
  size integer not null check(size>0), mime_type text not null check(mime_type='image/webp'),
  state text not null default 'active' check(state in ('active','deleting')),
  created_at timestamptz not null default now()
);
create table public.blog_post_media (
  post_id uuid references public.blog_posts(id) on delete cascade,
  media_id uuid references public.blog_media(id) on delete restrict,
  primary key(post_id,media_id)
);
create table public.blog_working_copies (
  post_id uuid primary key references public.blog_posts(id) on delete cascade,
  payload jsonb not null, updated_by uuid not null references auth.users(id),
  base_updated_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.blog_working_copies enable row level security;
create policy working_copies_read on public.blog_working_copies for select to authenticated using (
  public.cms_role() in ('admin','editor') or exists(select 1 from public.blog_posts p where p.id=post_id and p.author_id=auth.uid() and public.cms_role()='author'));
create policy working_copies_write on public.blog_working_copies for all to authenticated using (
  public.cms_role() in ('admin','editor') or exists(select 1 from public.blog_posts p where p.id=post_id and p.author_id=auth.uid() and p.status in ('draft','in_review') and public.cms_role()='author'))
with check(updated_by=auth.uid() and (public.cms_role() in ('admin','editor') or exists(select 1 from public.blog_posts p where p.id=post_id and p.author_id=auth.uid() and p.status in ('draft','in_review') and public.cms_role()='author')));
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.blog_slug_redirects enable row level security;
alter table public.blog_media enable row level security;
alter table public.blog_post_media enable row level security;
create policy categories_read on public.blog_categories for select using(true);
create policy categories_write on public.blog_categories for all to authenticated using(public.cms_role() in ('admin','editor')) with check(public.cms_role() in ('admin','editor'));
create policy tags_read on public.blog_tags for select using(true);
create policy tags_write on public.blog_tags for all to authenticated using(public.cms_role() is not null) with check(public.cms_role() is not null);
create policy revisions_read on public.blog_revisions for select to authenticated using (exists(select 1 from public.blog_posts p where p.id=post_id and (public.cms_role() in ('admin','editor') or p.author_id=auth.uid())));
create policy redirects_read on public.blog_slug_redirects for select using(true);
create policy media_read on public.blog_media for select to authenticated using(public.cms_role() is not null);
create policy media_insert on public.blog_media for insert to authenticated with check(public.cms_role() is not null and owner_id=auth.uid());
create policy media_modify on public.blog_media for update to authenticated using(public.cms_role() in ('admin','editor') or (public.cms_role()='author' and owner_id=auth.uid())) with check(public.cms_role() in ('admin','editor') or (public.cms_role()='author' and owner_id=auth.uid()));
create policy media_delete on public.blog_media for delete to authenticated using(public.cms_role() in ('admin','editor') or owner_id=auth.uid());
create policy references_read on public.blog_post_media for select to authenticated using(public.cms_role() is not null);

create or replace function public.blog_validate_media_refs(html text, featured_url text) returns void
language plpgsql security definer set search_path=public as $$ declare asset record; begin
  for asset in select id,state from public.blog_media where url=featured_url or position(url in html)>0 for share loop
    if asset.state<>'active' then raise exception 'An image in this article is pending deletion. Replace it before saving.'; end if;
  end loop;
end $$;
revoke all on function public.blog_validate_media_refs(text,text) from public;
grant execute on function public.blog_validate_media_refs(text,text) to authenticated,service_role;

-- Metadata edits must not rewrite identity/storage references and bypass usage guards.
create or replace function public.blog_media_immutable() returns trigger
language plpgsql set search_path=public as $$ begin
  if new.id is distinct from old.id or new.owner_id is distinct from old.owner_id
    or new.url is distinct from old.url or new.storage_paths is distinct from old.storage_paths
    or new.srcset is distinct from old.srcset or new.width is distinct from old.width
    or new.height is distinct from old.height or new.size is distinct from old.size
    or new.mime_type is distinct from old.mime_type
    or new.created_at is distinct from old.created_at then
    raise exception 'Media storage identity cannot be changed. Upload a replacement image instead.';
  end if;
  return new;
end $$;
create trigger blog_media_immutable before update on public.blog_media for each row execute function public.blog_media_immutable();

create or replace function public.blog_copy_validate_media() returns trigger
language plpgsql set search_path=public as $$ begin
  perform public.blog_validate_media_refs(new.payload->>'content',new.payload->>'image');
  return new;
end $$;
create trigger blog_copy_validate_media before insert or update on public.blog_working_copies for each row execute function public.blog_copy_validate_media();

create or replace function public.blog_v2_before_save() returns trigger
language plpgsql set search_path=public as $$ begin
  if new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(new.slug)>160 then raise exception 'Invalid slug'; end if;
  if exists(select 1 from public.blog_slug_redirects where old_slug=new.slug) then raise exception 'Slug is reserved by an existing redirect'; end if;
  new.category := coalesce(nullif(trim(new.category),''),'General');
  perform public.blog_validate_media_refs(new.content,new.image);
  if length(new.title)>200 or length(new.excerpt)>500 or length(new.content)>1000000 then raise exception 'Article exceeds limits'; end if;
  if new.status='scheduled' and (new.scheduled_at is null or new.scheduled_at<=now()) then raise exception 'Schedule must be in the future'; end if;
  if new.status in ('published','scheduled') and (length(trim(new.title))=0 or length(trim(new.content))=0 or length(trim(new.excerpt))=0 or (coalesce(new.image,'')<>'' and length(trim(new.image_alt))=0)) then raise exception 'Title, content, excerpt and image alt text required'; end if;
  new.published := new.status='published';
  if new.published then new.published_at := coalesce(new.published_at,now()); end if;
  new.updated_at := clock_timestamp();
  return new;
end $$;
create trigger blog_v2_validate before insert or update on public.blog_posts for each row execute function public.blog_v2_before_save();

create or replace function public.blog_v2_after_save() returns trigger
language plpgsql security definer set search_path=public as $$ declare tag text; begin
  insert into public.blog_revisions(post_id,snapshot,created_by) values(new.id,to_jsonb(new),auth.uid());
  if tg_op='UPDATE' and old.slug<>new.slug then
    if exists(select 1 from public.blog_slug_redirects where old_slug=new.slug) then raise exception 'Slug is reserved by an existing redirect'; end if;
    if old.published_at is not null then
      update public.blog_slug_redirects set new_slug=new.slug where new_slug=old.slug;
      insert into public.blog_slug_redirects(old_slug,new_slug) values(old.slug,new.slug) on conflict(old_slug) do update set new_slug=excluded.new_slug;
    end if;
  end if;
  insert into public.blog_categories(name,slug) values(new.category,trim(both '-' from regexp_replace(lower(new.category),'[^a-z0-9]+','-','g'))) on conflict do nothing;
  foreach tag in array new.tags loop
    insert into public.blog_tags(name,slug) values(tag,trim(both '-' from regexp_replace(lower(tag),'[^a-z0-9]+','-','g'))) on conflict do nothing;
  end loop;
  delete from public.blog_post_media where post_id=new.id;
  insert into public.blog_post_media(post_id,media_id) select new.id,m.id from public.blog_media m
    where m.url=new.image or position(m.url in new.content)>0;
  return new;
end $$;
create trigger blog_v2_revisions after insert or update on public.blog_posts for each row execute function public.blog_v2_after_save();

create or replace function public.save_blog_working_copy(payload jsonb, base_version timestamptz, expected_copy_version timestamptz default null)
returns timestamptz language plpgsql security invoker set search_path=public as $$
declare saved_at timestamptz; actual_version timestamptz; begin
  if public.cms_role() is null then raise exception 'CMS access required'; end if;
  select updated_at into actual_version from public.blog_posts where id=(payload->>'id')::uuid for share;
  if actual_version is null or actual_version<>base_version then raise exception 'Conflict: the article changed. Reload before saving.'; end if;
  perform public.blog_validate_media_refs(payload->>'content',payload->>'image');
  insert into public.blog_working_copies(post_id,payload,updated_by,base_updated_at,updated_at)
  values((payload->>'id')::uuid,payload,auth.uid(),base_version,clock_timestamp())
  on conflict(post_id) do update set payload=excluded.payload,updated_by=auth.uid(),base_updated_at=base_version,updated_at=clock_timestamp()
  where blog_working_copies.updated_at=expected_copy_version returning updated_at into saved_at;
  if saved_at is null then raise exception 'Conflict: another editor saved this working draft. Reload before saving.'; end if;
  return saved_at;
end $$;
revoke all on function public.save_blog_working_copy(jsonb,timestamptz,timestamptz) from public;
grant execute on function public.save_blog_working_copy(jsonb,timestamptz,timestamptz) to authenticated;

create or replace function public.blog_copy_revision() returns trigger language plpgsql security definer set search_path=public as $$ begin
  insert into public.blog_revisions(post_id,snapshot,created_by) values(new.post_id,new.payload,new.updated_by);return new;
end $$;
create trigger blog_copy_revision after insert or update on public.blog_working_copies for each row execute function public.blog_copy_revision();

create or replace function public.cms_media_usage(asset_id uuid) returns table(post_id uuid)
language plpgsql security definer set search_path=public as $$ declare asset_url text; begin
  if public.cms_role() is null then raise exception 'CMS access required'; end if;
  select url into asset_url from public.blog_media where id=asset_id;
  return query select pm.post_id from public.blog_post_media pm where pm.media_id=asset_id
  union select wc.post_id from public.blog_working_copies wc where wc.payload->>'image'=asset_url or position(asset_url in (wc.payload->>'content'))>0
  union select r.post_id from public.blog_revisions r where r.snapshot->>'image'=asset_url or position(asset_url in (r.snapshot->>'content'))>0;
end $$;
revoke all on function public.cms_media_usage(uuid) from public;
grant execute on function public.cms_media_usage(uuid) to authenticated;
create or replace function public.begin_blog_media_deletion(asset_id uuid) returns void
language plpgsql security invoker set search_path=public as $$ declare asset public.blog_media; begin
  select * into asset from public.blog_media where id=asset_id for update;
  if asset.id is null then raise exception 'Media asset not found'; end if;
  if exists(select 1 from public.cms_media_usage(asset_id)) then raise exception 'Media is used by an article, working draft or retained revision'; end if;
  update public.blog_media set state='deleting' where id=asset_id;
  if not found then raise exception 'You do not have permission to delete this image'; end if;
end $$;
revoke all on function public.begin_blog_media_deletion(uuid) from public;
grant execute on function public.begin_blog_media_deletion(uuid) to authenticated;
drop policy media_delete on public.blog_media;
create policy media_delete on public.blog_media for delete to authenticated using (
  (public.cms_role() in ('admin','editor') or (public.cms_role()='author' and owner_id=auth.uid()))
  and state='deleting' and not exists(select 1 from public.cms_media_usage(id)));

-- Atomic optimistic concurrency and UUID idempotency prevent overwritten edits/duplicate drafts.
create or replace function public.save_blog_post(payload jsonb, expected_updated_at timestamptz default null)
returns public.blog_posts language plpgsql security invoker set search_path=public as $$
declare current_post public.blog_posts; saved public.blog_posts; row_id uuid := (payload->>'id')::uuid; begin
  if public.cms_role() is null then raise exception 'CMS access required'; end if;
  select * into current_post from public.blog_posts where id=row_id for update;
  if found then
    if expected_updated_at is null or current_post.updated_at<>expected_updated_at then raise exception 'Conflict: article changed. Reload before saving.'; end if;
    update public.blog_posts set slug=payload->>'slug', title=payload->>'title', excerpt=payload->>'excerpt', content=payload->>'content',
      category=payload->>'category', tags=array(select jsonb_array_elements_text(payload->'tags')),
      image=payload->>'image', image_alt=payload->>'image_alt', image_width=(payload->>'image_width')::int,
      image_height=(payload->>'image_height')::int, image_srcset=payload->>'image_srcset',
      editor_json=payload->'editor_json', seo=payload->'seo', featured=coalesce((payload->>'featured')::boolean,false),
      status=payload->>'status', scheduled_at=(payload->>'scheduled_at')::timestamptz,
      media_ids=array(select jsonb_array_elements_text(payload->'media_ids'))::uuid[]
      where id=row_id returning * into saved;
    if saved.id is null then raise exception 'Not permitted to edit this article'; end if;
  else
    insert into public.blog_posts(id,slug,title,excerpt,content,author,author_id,category,tags,image,image_alt,image_width,image_height,image_srcset,editor_json,seo,featured,status,scheduled_at,media_ids)
    values(row_id,payload->>'slug',payload->>'title',payload->>'excerpt',payload->>'content',
      (select display_name from public.cms_members where user_id=auth.uid()),auth.uid(),payload->>'category',
      array(select jsonb_array_elements_text(payload->'tags')),payload->>'image',payload->>'image_alt',
      (payload->>'image_width')::int,(payload->>'image_height')::int,payload->>'image_srcset',payload->'editor_json',payload->'seo',
      coalesce((payload->>'featured')::boolean,false),payload->>'status',(payload->>'scheduled_at')::timestamptz,
      array(select jsonb_array_elements_text(payload->'media_ids'))::uuid[]) returning * into saved;
  end if;
  return saved;
end $$;
revoke all on function public.save_blog_post(jsonb,timestamptz) from public;
grant execute on function public.save_blog_post(jsonb,timestamptz) to authenticated;

-- Executed by a real server scheduler, never by a browser timer.
create or replace function public.publish_due_blog_posts() returns integer
language plpgsql security definer set search_path=public as $$ declare affected integer; begin
  update public.blog_posts set status='published', published_at=coalesce(published_at,now())
  where status='scheduled' and scheduled_at<=now();
  get diagnostics affected=row_count; return affected;
end $$;
revoke all on function public.publish_due_blog_posts() from public,anon,authenticated;
grant execute on function public.publish_due_blog_posts() to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('blog-media','blog-media',true,10485760,array['image/webp']) on conflict(id) do nothing;
create policy blog_media_upload on storage.objects for insert to authenticated
with check(bucket_id='blog-media' and public.cms_role() is not null and (storage.foldername(name))[1]=auth.uid()::text);
create policy blog_media_storage_delete on storage.objects for delete to authenticated
using(bucket_id='blog-media' and (public.cms_role() in ('admin','editor') or (public.cms_role()='author' and (storage.foldername(name))[1]=auth.uid()::text))
  and not exists(select 1 from public.blog_media m where name=any(m.storage_paths) and (m.state<>'deleting' or exists(select 1 from public.cms_media_usage(m.id)))));

grant select on public.blog_posts,public.blog_categories,public.blog_tags,public.blog_slug_redirects to anon;
grant select,insert,update,delete on public.blog_posts,public.cms_members,public.blog_categories,public.blog_tags,public.blog_media to authenticated;
grant select on public.blog_revisions,public.blog_post_media,public.blog_slug_redirects to authenticated;
grant select,insert,update,delete on public.blog_working_copies to authenticated;
commit;
