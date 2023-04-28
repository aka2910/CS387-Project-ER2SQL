
CREATE TABLE course (
    course_id varchar(8),
    title varchar(50),
    credits numeric(2, 0) check (credits > 0),
    PRIMARY KEY (course_id)
);

CREATE TABLE section (
    sec_id varchar(8),
    semester varchar(6) check (
        semester in ('Fall', 'Winter', 'Spring', 'Summer')
    ),
    year numeric(4, 0) check (
        year > 1701
        and year < 2100
    ),
    course_id varchar(8),
    PRIMARY KEY (sec_id, semester, year, course_id),
    FOREIGN KEY (course_id) REFERENCES course
);