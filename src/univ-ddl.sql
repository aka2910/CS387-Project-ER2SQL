CREATE TABLE classroom (
building string,
room_number int,
capacity int,
PRIMARY KEY (building, room_number)
);

CREATE TABLE time_slot (
time_slot_id int,
PRIMARY KEY (time_slot_id)
);

CREATE TABLE department (
dept_name string,
building string,
budget int,
PRIMARY KEY (dept_name)
);

CREATE TABLE course (
course_id string,
title string,
credits int,
dept_name string NOT NULL,
PRIMARY KEY (course_id),
FOREIGN KEY (dept_name) REFERENCES department
);

CREATE TABLE section (
sec_id int,
semester string,
year int,
course_id string,
building string NOT NULL,
room_number int NOT NULL,
time_slot_id int NOT NULL,
PRIMARY KEY (sec_id, semester, year, course_id),
FOREIGN KEY (course_id) REFERENCES course,
FOREIGN KEY (building, room_number) REFERENCES classroom,
FOREIGN KEY (time_slot_id) REFERENCES time_slot
);

CREATE TABLE instructor (
ID int,
name string,
salary int,
dept_name string NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (dept_name) REFERENCES department
);

CREATE TABLE teaches (
ID int,
sec_id int,
semester string,
year int,
course_id string,
PRIMARY KEY (ID, sec_id, semester, year, course_id),
FOREIGN KEY (ID) REFERENCES instructor,
FOREIGN KEY (sec_id, semester, year, course_id) REFERENCES section
);

CREATE TABLE student (
ID int,
name string,
tot_cred int,
dept_name string NOT NULL,
instructor_ID int,
PRIMARY KEY (ID),
FOREIGN KEY (dept_name) REFERENCES department,
FOREIGN KEY (instructor_ID) REFERENCES instructor
);

CREATE TABLE takes (
grade int,
ID int,
sec_id int,
semester string,
year int,
course_id string,
PRIMARY KEY (ID, sec_id, semester, year, course_id),
FOREIGN KEY (ID) REFERENCES student,
FOREIGN KEY (sec_id, semester, year, course_id) REFERENCES section
);

