CREATE TABLE department (
dept_name undefined,
building undefined,
budget undefined,
PRIMARY KEY (dept_name)
);

CREATE TABLE student (
ID undefined,
name undefined,
tot_cred undefined,
dept_name undefined NOT NULL,
instructor_ID undefined,
PRIMARY KEY (ID),
FOREIGN KEY (dept_name) REFERENCES department,
FOREIGN KEY (instructor_ID) REFERENCES instructor
);

CREATE TABLE instructor (
ID undefined,
name undefined,
salary undefined,
dept_name undefined NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (dept_name) REFERENCES department
);

CREATE TABLE section (
sec_id undefined,
semester undefined,
year undefined,
course_id undefined,
building undefined NOT NULL,
room_number undefined NOT NULL,
time_slot_id undefined NOT NULL,
PRIMARY KEY (sec_id, semester, year, course_id),
FOREIGN KEY (course_id) REFERENCES course,
FOREIGN KEY (building, room_number) REFERENCES classroom,
FOREIGN KEY (time_slot_id) REFERENCES time_slot
);

CREATE TABLE time_slot (
time_slot_id undefined,
PRIMARY KEY (time_slot_id)
);

CREATE TABLE classroom (
building undefined,
room_number undefined,
capacity undefined,
PRIMARY KEY (building, room_number)
);

CREATE TABLE course (
course_id undefined,
title undefined,
credits undefined,
dept_name undefined NOT NULL,
PRIMARY KEY (course_id),
FOREIGN KEY (dept_name) REFERENCES department
);

CREATE TABLE takes (
grade undefined,
ID undefined,
sec_id undefined,
semester undefined,
year undefined,
course_id undefined,
PRIMARY KEY (ID, sec_id, semester, year, course_id),
FOREIGN KEY (ID) REFERENCES student,
FOREIGN KEY (sec_id, semester, year, course_id) REFERENCES section
);

CREATE TABLE teaches (
ID undefined,
sec_id undefined,
semester undefined,
year undefined,
course_id undefined,
PRIMARY KEY (ID, sec_id, semester, year, course_id),
FOREIGN KEY (ID) REFERENCES instructor,
FOREIGN KEY (sec_id, semester, year, course_id) REFERENCES section
);

