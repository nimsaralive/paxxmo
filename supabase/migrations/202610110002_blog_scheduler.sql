-- Optional infrastructure migration: enable Supabase Cron before running.
-- The deployment-hook secret is stored in Vault; never ship it to a browser.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('paxxmo-publish-due','* * * * *','select public.publish_due_blog_posts()');

create or replace function public.blog_rebuild_hook() returns trigger
language plpgsql security definer set search_path=public,extensions as $$ declare hook text; begin
  if (tg_op='INSERT' and new.status<>'published') or
     (tg_op='UPDATE' and old.status<>'published' and new.status<>'published') or
     (tg_op='DELETE' and old.status<>'published') then return null; end if;
  select decrypted_secret into hook from vault.decrypted_secrets where name='paxxmo_blog_deploy_hook' limit 1;
  if hook is not null then perform net.http_post(url:=hook,body:='{}'::jsonb); end if;
  return null;
end $$;
create trigger blog_v2_rebuild after insert or update or delete on public.blog_posts
for each row execute function public.blog_rebuild_hook();
