Chorégraphie
============

Watch and understand the behavior of applications hosted in a datacenter. Can be used alone or alongside Kibana.
This NodeJS application can be connected to ElasticSearch, MongoDB or any (R)DBMS by a module system.

The first version of Chorégraphie is allready used in a datacenter.

#Purpose:

Chorégraphie's goal is to:

-  untangle the web of calls between your applications
-  plot an history of their values
-  warn you when the behaviour of an application has changed

You have the charge of managing a lot of applications in a complex structure? Understanding the behavior of this web takes you too much time? Chorégraphie, pronounced \[kɔʀegʀafi\] (korégrafi), takes JSON as input and give you a set of diagrams and charts allowing you to understand how things works.

#Screenshots
2D, 3D or Anaglyph view of the applications's interactions in a **real datacenter**:

![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/callTree.png)
![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/callTree3D.png)

Data of a particular application:
![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/history.png)

# Where is the code?

Chorégraphie v1 is using Symfony + PostgreSQL. This repository will be used for the v2.
The v2 will use NodeJS and will be pluggable to any DBMS.

For the moment, the code is in the **dev** branch.
