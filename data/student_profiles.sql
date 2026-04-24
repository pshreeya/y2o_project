-- Table: public.student_profiles

-- DROP TABLE IF EXISTS public.student_profiles;

CREATE TABLE IF NOT EXISTS public.student_profiles
(
    id bigint NOT NULL DEFAULT nextval('student_profiles_id_seq'::regclass),
    age integer,
    grade character varying(50) COLLATE pg_catalog."default",
    school character varying(255) COLLATE pg_catalog."default",
    school_board character varying(255) COLLATE pg_catalog."default",
    top_interests character varying[] COLLATE pg_catalog."default",
    primary_goal character varying(255) COLLATE pg_catalog."default",
    user_id bigint,
    CONSTRAINT student_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.student_profiles
    OWNER to postgres;