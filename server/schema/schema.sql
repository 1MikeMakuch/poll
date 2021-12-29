
-- tiny blob    255b
-- blob         64kb
-- mediumblob   16Mb
-- longblob     5Gb

drop table if exists keyvals;
create table keyvals (
    id varchar(255) not null,
    data varchar(1024) default null,
    primary key(id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists users;
create table users (
    id int(11) not null auto_increment,
    tenant_id int default null,
    email varchar(100) default null,
    name varchar(100) default null,
    password varchar(255) default null,
    is_admin int default 0,
    primary key(id),
    unique key email (email),
    key(tenant_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists polls;
create table polls (
    id int(11) not null auto_increment,
    tenant_id int default null,
    name varchar(100) default null,
    description varchar(500) default null,
    primary key(id),
    key(name),
    key(tenant_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
drop table if exists poll_runs;
create table poll_runs (
    id int(11) not null auto_increment,
    poll_id int default null,
    primary key(id),
    key(poll_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
drop table if exists poll_run_statuses;
create table poll_run_statuses (
    id int(11) not null auto_increment,
    poll_run_id int default null,
    user_id int default null,
    status enum('sent', 'viewed', 'in_progress', 'completed') default null,
    primary key(id),
    key(poll_run_id),
    key(user_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists poll_users;
create table poll_users (
    id int(11) not null auto_increment,
    poll_id int default null,
    email varchar(100) default null,
    first_name varchar(50) default null,
    last_name varchar(50) default null,
    phone varchar(50) default null,
    primary key(id),
    key (poll_id),
    key (email),
    key (phone),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists questions;
create table questions (
    id int(11) not null auto_increment,
    poll_run_id int default null,
    question_id int default null,
    question varchar(100) default null,
    primary key(id),
    unique(poll_run_id, question_id),
    key(poll_run_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists urls;
create table urls (
    id int(11) not null auto_increment,
    poll_run_id int default null,
    user_id int default null,
    uuid varchar(100) default null,
    primary key(id),
    key(user_id),
    key(poll_run_id),
    key(uuid),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table if exists answers;
create table answers (
    id int(11) not null auto_increment,
    user_id int default null,
    poll_run_id int default null,
    answer enum('yes', 'no') default null,
    primary key(id),
    key(poll_run_id),
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


