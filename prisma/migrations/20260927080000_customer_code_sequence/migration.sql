CREATE SEQUENCE "customer_code_seq" START 1001 OWNED BY "customers"."code";

ALTER TABLE "customers" ALTER COLUMN "code" SET DEFAULT (('SPC-'::text || nextval('customer_code_seq'::regclass)) || substr('ABCDEFGHJKMNPQRSTUVWXYZ'::text, ((floor((random() * (23)::double precision)))::integer + 1), 1)) || substr('ABCDEFGHJKMNPQRSTUVWXYZ'::text, ((floor((random() * (23)::double precision)))::integer + 1), 1);
