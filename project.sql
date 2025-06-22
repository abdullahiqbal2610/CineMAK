
use master

create database project;
go
use project;
go

create table users (
userid int identity(1,1) primary key,
fullname varchar(255) not null,
email varchar(255) not null unique check (email like '%@%'),
password varchar(255) not null check (
len(password) >= 8 and 
password like '%[0-9]%' and 
password like '%[a-zA-Z]%'
),
phonenum varchar(20) not null check (
len(phonenum) >= 10 and 
phonenum not like '%[^0-9]%'
),
gender varchar(10) not null,
usertype varchar(10) not null check (usertype in ('admin','customer'))
);
go

create table administrator (
adminid int identity(1,1) primary key,
userid int,
constraint f1 foreign key (userid) references users(userid)
);
go

create table customers (
customerid int identity(1,1) primary key,
userid int,
constraint f2 foreign key (userid) references users(userid)
);
go

create table genre (
genreid int identity(1,1) primary key,
genretype varchar(255) not null,
genresynoyms text not null
);
go

create table movies (
movieid int identity(1,1) primary key,
title varchar(255) not null,
genreid int,
duration int check (duration > 0),
releasedate date not null,
rating decimal(2,1) not null check (rating between 0 and 9.9),
description varchar(max) not null,
isreleased as (case when releasedate <= cast(getdate() as date) then 1 else 0 end),
posterUrl varchar(4096),
constraint fk_movies_genre foreign key (genreid) references genre(genreid)
);
go

create table nowshowing (
movieid int primary key,
constraint fk_now_showing foreign key (movieid) references movies(movieid)
);
go

create table seatingplan (
seatid int identity(1,1) primary key,
seattype varchar(255) not null check (seattype in ('plat', 'gold', 'regular')),
seatprice int check (seatprice > 0) -- price for each seat type
);
go

create table showtime (
showtimeid int identity(1,1) primary key,
startingtime datetime not null,
endingtime datetime not null,
movieid int not null,
constraint fk_showtime_movies foreign key (movieid) references movies(movieid)
);
go

create table showtimeseating (
showtimeseatid int identity(1,1) primary key,
showtimeid int not null,
seatid int not null, 
seatfull bit default 0 check (seatfull in (0,1)), 
constraint fk_showtimeseating_showtime foreign key (showtimeid) references showtime(showtimeid),
constraint fk_showtimeseating_seatingplan foreign key (seatid) references seatingplan(seatid)
);
go

create table reservations (
resid int identity(1,1) primary key,
customerid int not null,
showtimeid int not null,
reservationdate date not null,
constraint fk_reservations_customers foreign key (customerid) references customers(customerid),
constraint fk_reservations_showtime foreign key (showtimeid) references showtime(showtimeid)
);
go

create table checkout (
checkoutid int identity(1,1) primary key,
resid int not null,
amount int not null check (amount > 0),
bankacc varchar(50) not null, 
constraint fk_checkout_reservations foreign key (resid) references reservations(resid)
);
go




create table feedback (
feedbackid int identity(1,1) primary key,
customerid int not null,
review text not null,
rating int check (rating between 0 and 5),
constraint fk_feedback_users foreign key (customerid) references customers(customerid)
);
go

create table reservationdetails (
resdetailid int identity(1,1) primary key,
resid int not null,          
showtimeseatid int not null, 
constraint fk_reservationdetails_reservations foreign key (resid) references reservations(resid),
constraint fk_reservationdetails_showtimeseating foreign key (showtimeseatid) references showtimeseating(showtimeseatid)
);
go

select * from checkout;
select * from feedback;
select * from movies;
select * from genre;
select * from seatingplan;
select * from showtime;
select * from showtimeseating;
select * from users;
select * from administrator;
select * from customers;
select * from reservationdetails;
select * from reservations;
select* from nowshowing;
go




insert into genre (genretype, genresynoyms)
values 
('action', 'action-packed, adventure, combat, thrill'),
('comedy', 'humor, funny, laugh, lighthearted'),
('drama', 'serious, emotional, realistic, tension'),
('romance', 'love, passion, relationship, heart'),
('horror', 'scary, frightening, terror, chilling'),
('thriller', 'suspense, mystery, intrigue, crime'),
('fantasy', 'magic, mythical, imagination, adventure'),
('sci-fi', 'science fiction, futuristic, space, technology'),
('animation', 'cartoon, cgi, family-friendly, animated');
go

insert into seatingplan (seattype, seatprice)
values 
('plat', 1250),
('gold', 1000),
('regular', 750);
go


--------------------------------------------------------------------------
create procedure fill_nowshowing
as
begin
   
delete from nowshowing;
insert into nowshowing (movieid)
select top 5 movieid
from movies
where isreleased = 1
order by releasedate asc;
end;
go


exec fill_nowshowing;


create procedure update_now_showing
as
begin
set nocount on
declare @new_movie int;
select top 1 @new_movie = movieid
from movies
where cast(releasedate as date) = cast(getdate() as date)
and movieid not in (select movieid from nowshowing)
order by releasedate asc;
if @new_movie is null
return; 
declare @old_movie int;
select top 1 @old_movie = n.movieid
from nowshowing n
inner join movies m on n.movieid = m.movieid
order by m.releasedate asc;
insert into nowshowing (movieid)
values (@new_movie);
delete from nowshowing
where movieid = @old_movie;
update showtime
set movieid = @new_movie
where movieid = @old_movie;
end;
go

exec update_now_showing;


create procedure createnewuser
 

    @fullname varchar(255),
    @email varchar(255),
    @password varchar(255),
    @phonenum varchar(20),
    @gender varchar(10),
    @usertype varchar(10) 
as
begin
    set nocount on
insert into users (fullname, email, password, phonenum, gender, usertype)
values (@fullname,@email, @password,@phonenum,@gender,@usertype);

declare @newuserid int = scope_identity();
if @usertype = 'admin'
begin
insert into administrator (userid)
values (@newuserid);
end
else if @usertype = 'customer'
 begin
 insert into customers (userid)
 values (@newuserid);
end
end;
go

exec createnewuser
    @fullname = 'admin1',
    @email = 'admin1@email.com',
    @password = 'admin123',
    @phonenum = '0123456789',
    @gender = 'male',
    @usertype = 'admin';
go

exec createnewuser
    @fullname = 'customer1',
    @email = 'customer1@email.com',
    @password = 'customer123',
    @phonenum = '0123456789',
    @gender = 'male',
    @usertype = 'customer';
go

create procedure assign_showtimes
 @date date
as
begin
set nocount on
declare @slot1start datetime = dateadd(hour,9,cast(@date as datetime));		
declare @slot1end datetime = dateadd(hour,3,@slot1start);
declare @slot2start datetime = dateadd(hour,4,@slot1end);
declare @slot2end datetime = dateadd(hour,3,@slot2start);
declare @slot3start datetime = dateadd(hour,2,@slot2end);
declare @slot3end datetime = dateadd(hour,3,@slot3start);
declare @slot4start datetime = dateadd(hour,2,@slot3end);
declare @slot4end datetime = dateadd(hour,3,@slot4start);
declare @slot5start datetime = dateadd(hour,2,@slot4end);
declare @slot5end datetime = dateadd(hour,3,@slot5start);

declare @movies table(rn int, movieid int);
insert into @movies (rn, movieid)
select row_number() over(order by movieid asc) as rn, movieid
from nowshowing;

declare @i int = 1;
while @i <= 5
begin
declare @movieid int;
select @movieid = movieid from @movies where rn = @i;
if @movieid is not null
 begin
if @i = 1
insert into showtime (startingtime, endingtime, movieid)
values (@slot1start, @slot1end, @movieid);
else if @i = 2
insert into showtime (startingtime, endingtime, movieid)
values (@slot2start, @slot2end, @movieid);
else if @i = 3
insert into showtime (startingtime, endingtime, movieid)
values (@slot3start, @slot3end, @movieid);
 else if @i = 4
 insert into showtime (startingtime, endingtime, movieid)
 values (@slot4start, @slot4end, @movieid);
 else if @i = 5
 insert into showtime (startingtime, endingtime, movieid)
values (@slot5start, @slot5end, @movieid);
end
set @i = @i + 1;
end
end;
go

exec assign_showtimes '2025-05-12';
go

create procedure addshowtimeseats
@showtimeid int
as
begin
    set nocount on
declare @platseatid int, @goldseatid int, @regularseatid int;
select @platseatid = seatid from seatingplan where seattype = 'plat';
select @goldseatid = seatid from seatingplan where seattype = 'gold';
select @regularseatid = seatid from seatingplan where seattype = 'regular';

declare @i int = 1;
while @i <= 10
begin
insert into showtimeseating (showtimeid, seatid, seatfull)
values (@showtimeid, @platseatid, 0);
set @i = @i + 1;
end;
set @i = 1;
while @i <= 15
begin
insert into showtimeseating (showtimeid, seatid, seatfull)
values (@showtimeid, @goldseatid, 0);
set @i = @i + 1;
end;
set @i = 1;
while @i <= 25
begin
insert into showtimeseating (showtimeid, seatid, seatfull)
values (@showtimeid, @regularseatid, 0);
set @i = @i + 1;
end;
end;
go

exec addshowtimeseats @showtimeid = 1;
go


create procedure bookmultipleseatsforalltypes
@showtimeid int,
@customerid int,
@platcount int,
@goldcount int,
@regularcount int,
@newresid int output
as 
begin
set nocount on
begin tran;
declare @platseatid int, @goldseatid int, @regularseatid int;
declare @availplat int, @availgold int, @availregular int;
select @availplat = count(*) 
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'plat' and s.showtimeid = @showtimeid and s.seatfull = 0;
select @availgold = count(*) 
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'gold' and s.showtimeid = @showtimeid and s.seatfull = 0;
select @availregular = count(*) 
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'regular' and s.showtimeid = @showtimeid and s.seatfull = 0;
if (@platcount > @availplat or @goldcount > @availgold or @regularcount > @availregular)
begin
rollback tran;
raiserror('insufficient seats available', 16, 1);
return;
end
insert into reservations (customerid, showtimeid, reservationdate)
values (@customerid, @showtimeid, cast(getdate() as date));
set @newresid = scope_identity();
declare @bookedseatid int, @i int;
set @i = 1;
while @i <= @platcount
begin
select top 1 @bookedseatid = showtimeseatid
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'plat' and s.showtimeid = @showtimeid and s.seatfull = 0
order by s.showtimeseatid asc;
if @bookedseatid is not null
begin
update showtimeseating set seatfull = 1 where showtimeseatid = @bookedseatid;
insert into reservationdetails (resid, showtimeseatid) values (@newresid, @bookedseatid);
end
else
break;
set @i = @i + 1;
end;
set @i = 1;
while @i <= @goldcount
begin
select top 1 @bookedseatid = showtimeseatid
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'gold' and s.showtimeid = @showtimeid and s.seatfull = 0
order by s.showtimeseatid asc;
if @bookedseatid is not null
begin
update showtimeseating set seatfull = 1 where showtimeseatid = @bookedseatid;
insert into reservationdetails (resid, showtimeseatid) values (@newresid, @bookedseatid);
end
else
break;
set @i = @i + 1;
end;
set @i = 1;
while @i <= @regularcount
begin
select top 1 @bookedseatid = showtimeseatid
from showtimeseating s
join seatingplan p on s.seatid = p.seatid
where p.seattype = 'regular' and s.showtimeid = @showtimeid and s.seatfull = 0
order by s.showtimeseatid asc;
if @bookedseatid is not null
begin
update showtimeseating set seatfull = 1 where showtimeseatid = @bookedseatid;
insert into reservationdetails (resid, showtimeseatid) values (@newresid, @bookedseatid);
end
else
break;
set @i = @i + 1;
end;
commit tran;
end;
go
declare @newreservation int;
exec bookmultipleseatsforalltypes
    @showtimeid = 1,
    @customerid = 1,
    @platcount = 0,
    @goldcount = 0,
    @regularcount = 1,
    @newresid = @newreservation output;
select @newreservation as newreservationid;
go




create procedure calculatecheckoutbill
    @resid int,
    @bankacc varchar(50)
as
begin
set nocount on
declare @totalamount int;
select @totalamount = sum(sp.seatprice)
from reservationdetails rd
inner join showtimeseating ss on rd.showtimeseatid = ss.showtimeseatid
inner join seatingplan sp on ss.seatid = sp.seatid
where rd.resid = @resid;
if @totalamount is null
begin
set @totalamount = 0;
end
insert into checkout (resid, amount, bankacc)
values (@resid, @totalamount, @bankacc);
select 'checkout processed successfully.' as message, @resid as reservationid, @totalamount as totalamount;
end;
go


exec calculatecheckoutbill @resid =1 , @bankacc = '123456789';
go

create procedure addcustomerfeedback
    @customerid int,
    @review text,
    @rating int
as
begin
if @rating < 0 or @rating > 5.
begin
return;
end
if not exists (select 1 from customers where customerid = @customerid)
begin
return;
end

    
insert into feedback (customerid, review, rating)
values (@customerid, @review, @rating);
end;
go

exec addcustomerfeedback 
    @customerid = 1, 
    @review = 'great experience! loved the service.', 
    @rating = 5;
go

create view dailysummaryview as
select
sub.reservationdate,
sum(sub.totalresamount) as totalrevenue,
sum(sub.totalresseats) as seatssold,
count(sub.resid) as reservationscount
from
( select r.resid,
        cast(r.reservationdate as date) as reservationdate,
        (select isnull(sum(c.amount), 0)
            from checkout c
            where c.resid = r.resid
        ) as totalresamount,
        ( select count(*)
            from reservationdetails rd
            where rd.resid = r.resid
        ) as totalresseats
    from reservations r
) as sub
group by sub.reservationdate;
go

select *
from dailysummaryview
order by reservationdate desc;
go



