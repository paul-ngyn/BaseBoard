alter table company_settings drop column default_markup;

update company_settings
set business_name = 'Specialty Hardwood Floors', service_area = 'Alameda, CA'
where id = true;
