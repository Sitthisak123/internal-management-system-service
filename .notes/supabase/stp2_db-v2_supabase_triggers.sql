-- ฟังก์ชันสำหรับสร้าง Profile อัตโนมัติ
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'username' -- ดึง username มาจาก Metadata ตอนสมัคร
  );
  return new;
end;
$$;

-- ผูก Trigger เข้ากับตาราง auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
