-- Run against an isolated Supabase staging project AFTER migration 001.
-- Assertions raise on failure. The transaction rolls back every fixture.
begin;
insert into auth.users(id,email,created_at,updated_at) values
 ('fd130000-0000-4000-8000-000000000001','cms-test-admin@example.invalid',now(),now()),
 ('fd130000-0000-4000-8000-000000000002','cms-test-author@example.invalid',now(),now()),
 ('fd130000-0000-4000-8000-000000000003','cms-test-outsider@example.invalid',now(),now());
insert into public.cms_members(user_id,role,display_name) values
 ('fd130000-0000-4000-8000-000000000001','admin','Test admin'),
 ('fd130000-0000-4000-8000-000000000002','author','Test author');
set local role authenticated;
select set_config('request.jwt.claim.sub','fd130000-0000-4000-8000-000000000002',true);
select public.save_blog_post('{"id":"fd130000-0000-4000-8000-000000000010","slug":"cms-security-fixture","title":"Fixture article","excerpt":"Test excerpt","content":"<h2>Fixture</h2><p>Test content.</p>","category":"Testing","tags":[],"image":"","image_alt":"","seo":{},"status":"draft","media_ids":[]}'::jsonb,null);
do $$ declare payload jsonb; version timestamptz; begin
  if not exists(select 1 from public.blog_revisions where post_id='fd130000-0000-4000-8000-000000000010') then raise exception 'FAIL: revision missing'; end if;
  select to_jsonb(p),p.updated_at into payload,version from public.blog_posts p where id='fd130000-0000-4000-8000-000000000010';
  begin
    perform public.save_blog_post(payload||'{"status":"published"}'::jsonb,version);
    raise exception 'FAIL: author could publish';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_blog_post(payload,version-interval '1 day');
    raise exception 'FAIL: stale version could overwrite';
  exception when raise_exception then if sqlerrm not like 'Conflict:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','fd130000-0000-4000-8000-000000000003',true);
do $$ begin
  if exists(select 1 from public.blog_posts where id='fd130000-0000-4000-8000-000000000010') then raise exception 'FAIL: outsider can read draft'; end if;
  if public.cms_role() is not null then raise exception 'FAIL: outsider received a CMS role'; end if;
end $$;
set local role anon;
do $$ begin
  if exists(select 1 from public.blog_posts where id='fd130000-0000-4000-8000-000000000010') then raise exception 'FAIL: anonymous draft disclosure'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','fd130000-0000-4000-8000-000000000001',true);
do $$ declare payload jsonb; version timestamptz; copy_version timestamptz; begin
  select to_jsonb(p),p.updated_at into payload,version from public.blog_posts p where id='fd130000-0000-4000-8000-000000000010';
  perform public.save_blog_post(payload||'{"status":"published"}'::jsonb,version);
  select to_jsonb(p),p.updated_at into payload,version from public.blog_posts p where id='fd130000-0000-4000-8000-000000000010';
  copy_version:=public.save_blog_working_copy(payload||'{"title":"Working title"}'::jsonb,version,null);
  if (select title from public.blog_posts where id='fd130000-0000-4000-8000-000000000010')<>'Fixture article' then raise exception 'FAIL: working draft modified published content'; end if;
  begin
    perform public.save_blog_working_copy(payload,version,copy_version-interval '1 day');
    raise exception 'FAIL: stale working copy overwrote another editor';
  exception when raise_exception then if sqlerrm not like 'Conflict:%' then raise; end if; end;
  perform public.save_blog_post(payload||'{"slug":"cms-security-fixture-renamed"}'::jsonb,version);
  if not exists(select 1 from public.blog_slug_redirects where old_slug='cms-security-fixture' and new_slug='cms-security-fixture-renamed') then raise exception 'FAIL: published slug redirect missing'; end if;
end $$;
set local role anon;
do $$ begin
  if not exists(select 1 from public.blog_posts where slug='cms-security-fixture-renamed') then raise exception 'FAIL: public cannot read published content'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','fd130000-0000-4000-8000-000000000001',true);
insert into public.blog_media(id,owner_id,name,alt,url,storage_paths,srcset,width,height,size,mime_type)
values('fd130000-0000-4000-8000-000000000020','fd130000-0000-4000-8000-000000000001','Fixture media','An isolated security test image','https://example.invalid/fixture.webp',array['fd130000-0000-4000-8000-000000000001/fixture.webp'],'',480,320,1000,'image/webp');
do $$ declare payload jsonb; version timestamptz; copy_version timestamptz; begin
  begin
    update public.blog_media set url='https://example.invalid/changed.webp' where id='fd130000-0000-4000-8000-000000000020';
    raise exception 'FAIL: media identity could be rewritten';
  exception when raise_exception then if sqlerrm not like 'Media storage identity cannot be changed.%' then raise; end if; end;
  perform public.begin_blog_media_deletion('fd130000-0000-4000-8000-000000000020');
  select to_jsonb(p),p.updated_at into payload,version from public.blog_posts p where id='fd130000-0000-4000-8000-000000000010';
  select updated_at into copy_version from public.blog_working_copies where post_id='fd130000-0000-4000-8000-000000000010';
  begin
    perform public.save_blog_working_copy(payload||'{"image":"https://example.invalid/fixture.webp"}'::jsonb,version,copy_version);
    raise exception 'FAIL: pending-deletion media could enter a draft';
  exception when raise_exception then if sqlerrm not like 'An image in this article is pending deletion.%' then raise; end if; end;
end $$;
reset role;
rollback;
