begin;

create or replace function public.get_user_facility_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select facility_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_user_role() = 'admin', false);
$$;

grant execute on function public.get_user_facility_id() to authenticated;
grant execute on function public.get_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.networks enable row level security;
alter table public.assets enable row level security;
alter table public.vulnerabilities enable row level security;
alter table public.threats enable row level security;
alter table public.incidents enable row level security;
alter table public.alerts enable row level security;
alter table public.compliance_controls enable row level security;
alter table public.asset_relationships enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_select_admin_same_facility on public.profiles;
create policy profiles_select_admin_same_facility
on public.profiles
for select
to authenticated
using (
  public.is_admin()
  and facility_id = public.get_user_facility_id()
);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Facilities policies

drop policy if exists facilities_select_policy on public.facilities;
create policy facilities_select_policy
on public.facilities
for select
to authenticated
using (
  public.is_admin()
  or id = public.get_user_facility_id()
);

drop policy if exists facilities_insert_policy on public.facilities;
create policy facilities_insert_policy
on public.facilities
for insert
to authenticated
with check (public.is_admin());

drop policy if exists facilities_update_policy on public.facilities;
create policy facilities_update_policy
on public.facilities
for update
to authenticated
using (
  public.is_admin()
  or (public.get_user_role() = 'engineer' and id = public.get_user_facility_id())
)
with check (
  public.is_admin()
  or (public.get_user_role() = 'engineer' and id = public.get_user_facility_id())
);

drop policy if exists facilities_delete_policy on public.facilities;
create policy facilities_delete_policy
on public.facilities
for delete
to authenticated
using (
  public.is_admin()
  or (public.get_user_role() = 'engineer' and id = public.get_user_facility_id())
);

-- Shared facility-scoped policies

drop policy if exists networks_select_policy on public.networks;
create policy networks_select_policy
on public.networks
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists networks_modify_policy on public.networks;
create policy networks_modify_policy
on public.networks
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists assets_select_policy on public.assets;
create policy assets_select_policy
on public.assets
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists assets_modify_policy on public.assets;
create policy assets_modify_policy
on public.assets
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists vulnerabilities_select_policy on public.vulnerabilities;
create policy vulnerabilities_select_policy
on public.vulnerabilities
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists vulnerabilities_modify_policy on public.vulnerabilities;
create policy vulnerabilities_modify_policy
on public.vulnerabilities
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists threats_select_policy on public.threats;
create policy threats_select_policy
on public.threats
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists threats_modify_policy on public.threats;
create policy threats_modify_policy
on public.threats
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists incidents_select_policy on public.incidents;
create policy incidents_select_policy
on public.incidents
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists incidents_modify_policy on public.incidents;
create policy incidents_modify_policy
on public.incidents
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists alerts_select_policy on public.alerts;
create policy alerts_select_policy
on public.alerts
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists alerts_insert_policy on public.alerts;
create policy alerts_insert_policy
on public.alerts
for insert
to authenticated
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists alerts_update_policy on public.alerts;
create policy alerts_update_policy
on public.alerts
for update
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer', 'analyst')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer', 'analyst')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists alerts_delete_policy on public.alerts;
create policy alerts_delete_policy
on public.alerts
for delete
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists compliance_controls_select_policy on public.compliance_controls;
create policy compliance_controls_select_policy
on public.compliance_controls
for select
to authenticated
using (
  public.is_admin()
  or facility_id = public.get_user_facility_id()
);

drop policy if exists compliance_controls_modify_policy on public.compliance_controls;
create policy compliance_controls_modify_policy
on public.compliance_controls
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (public.is_admin() or facility_id = public.get_user_facility_id())
);

drop policy if exists asset_relationships_select_policy on public.asset_relationships;
create policy asset_relationships_select_policy
on public.asset_relationships
for select
to authenticated
using (
  public.is_admin()
  or (
    exists (
      select 1
      from public.assets source_asset
      where source_asset.id = source_asset_id
        and source_asset.facility_id = public.get_user_facility_id()
    )
    and exists (
      select 1
      from public.assets target_asset
      where target_asset.id = target_asset_id
        and target_asset.facility_id = public.get_user_facility_id()
    )
  )
);

drop policy if exists asset_relationships_modify_policy on public.asset_relationships;
create policy asset_relationships_modify_policy
on public.asset_relationships
for all
to authenticated
using (
  public.get_user_role() in ('admin', 'engineer')
  and (
    public.is_admin()
    or (
      exists (
        select 1
        from public.assets source_asset
        where source_asset.id = source_asset_id
          and source_asset.facility_id = public.get_user_facility_id()
      )
      and exists (
        select 1
        from public.assets target_asset
        where target_asset.id = target_asset_id
          and target_asset.facility_id = public.get_user_facility_id()
      )
    )
  )
)
with check (
  public.get_user_role() in ('admin', 'engineer')
  and (
    public.is_admin()
    or (
      exists (
        select 1
        from public.assets source_asset
        where source_asset.id = source_asset_id
          and source_asset.facility_id = public.get_user_facility_id()
      )
      and exists (
        select 1
        from public.assets target_asset
        where target_asset.id = target_asset_id
          and target_asset.facility_id = public.get_user_facility_id()
      )
    )
  )
);

drop policy if exists audit_logs_select_policy on public.audit_logs;
create policy audit_logs_select_policy
on public.audit_logs
for select
to authenticated
using (
  public.is_admin()
  or (facility_id is not null and facility_id = public.get_user_facility_id())
);

drop policy if exists audit_logs_insert_policy on public.audit_logs;
create policy audit_logs_insert_policy
on public.audit_logs
for insert
to authenticated
with check (
  public.is_admin()
  or (facility_id is not null and facility_id = public.get_user_facility_id())
);

commit;
