-- Table: public.parent_profiles

-- DROP TABLE IF EXISTS public.parent_profiles;

CREATE TABLE IF NOT EXISTS public.parent_profiles
(
    id bigint NOT NULL DEFAULT nextval('parent_profiles_id_seq'::regclass),
    teen_email character varying(255) COLLATE pg_catalog."default",
    primary_focus character varying(255) COLLATE pg_catalog."default",
    user_id bigint,
    CONSTRAINT parent_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.parent_profiles
    OWNER to postgres;