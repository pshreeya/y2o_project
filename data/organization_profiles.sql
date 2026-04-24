-- Table: public.organization_profiles

-- DROP TABLE IF EXISTS public.organization_profiles;

CREATE TABLE IF NOT EXISTS public.organization_profiles
(
    id bigint NOT NULL DEFAULT nextval('organization_profiles_id_seq'::regclass),
    org_name character varying(255) COLLATE pg_catalog."default",
    org_type character varying(100) COLLATE pg_catalog."default",
    org_size character varying(50) COLLATE pg_catalog."default",
    org_role character varying(100) COLLATE pg_catalog."default",
    primary_goal character varying(255) COLLATE pg_catalog."default",
    user_id bigint,
    CONSTRAINT organization_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.organization_profiles
    OWNER to postgres;