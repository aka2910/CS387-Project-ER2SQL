ER {
  entities: [
    Entity { name: 'department', attributes: [Array], is_weak: false },
    Entity { name: 'student', attributes: [Array], is_weak: false },
    Entity { name: 'instructor', attributes: [Array], is_weak: false },
    Entity { name: 'section', attributes: [Array], is_weak: true },
    Entity { name: 'time_slot', attributes: [Array], is_weak: false },
    Entity { name: 'classroom', attributes: [Array], is_weak: false },
    Entity { name: 'course', attributes: [Array], is_weak: false }
  ],
  relations: [
    Relation {
      name: 'stud_dept',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'inst_dept',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'advisor',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'partial',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'takes',
      e1: [Entity],
      e2: [Entity],
      c1: 'many',
      c2: 'many',
      p1: 'partial',
      p2: 'partial',
      is_weak: false,
      attributes: [Array]
    },
    Relation {
      name: 'teaches',
      e1: [Entity],
      e2: [Entity],
      c1: 'many',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'course_dept',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'sec_course',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: true,
      attributes: []
    },
    Relation {
      name: 'sec_class',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    },
    Relation {
      name: 'sec_time_slot',
      e1: [Entity],
      e2: [Entity],
      c1: 'one',
      c2: 'many',
      p1: 'partial',
      p2: 'total',
      is_weak: false,
      attributes: []
    }
  ],
  entity_map: {
    department: Entity { name: 'department', attributes: [Array], is_weak: false },
    student: Entity { name: 'student', attributes: [Array], is_weak: false },
    instructor: Entity { name: 'instructor', attributes: [Array], is_weak: false },
    section: Entity { name: 'section', attributes: [Array], is_weak: true },
    time_slot: Entity { name: 'time_slot', attributes: [Array], is_weak: false },
    classroom: Entity { name: 'classroom', attributes: [Array], is_weak: false },
    course: Entity { name: 'course', attributes: [Array], is_weak: false }
  }
}
CREATE TABLE department (
dept_name string,
building string,
budget int,
PRIMARY KEY (dept_name)
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

CREATE TABLE instructor (
ID int,
name string,
salary int,
dept_name string NOT NULL,
PRIMARY KEY (ID),
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

CREATE TABLE time_slot (
time_slot_id int,
PRIMARY KEY (time_slot_id)
);

CREATE TABLE classroom (
building string,
room_number int,
capacity int,
PRIMARY KEY (building, room_number)
);

CREATE TABLE course (
course_id string,
title string,
credits int,
dept_name string NOT NULL,
PRIMARY KEY (course_id),
FOREIGN KEY (dept_name) REFERENCES department
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

