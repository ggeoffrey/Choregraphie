Chorégraphie
============

Watch and understand the behavior of applications hosted in a data center. Can be used alone or alongside Kibana.
This NodeJS application can be connected to ElasticSearch, MongoDB or any (R)DBMS by a module system.

The first version of Chorégraphie is already used in a data center.

#Purpose:

Chorégraphie's goal is to:

-  untangle the web of calls between your applications
-  plot an history of their values
-  warn you when the behavior of an application has changed

You have the charge of managing a lot of applications in a complex structure? Understanding the behavior of this web takes you too much time? Chorégraphie, pronounced \[kɔʀegʀafi\] (korégrafi), takes JSON as input and give you a set of diagrams and charts allowing you to understand how things works.

#Screenshots
2D, 3D or Anaglyph view of the applications' interactions in a **real data center**:

![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/callTree.png)
![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/callTree3D.png)

Data of a particular application:
![img](https://raw.github.com/ggeoffrey/Choregraphie/master/readme/history.png)

## A demo website is coming soon!

# Where is the code?

Chorégraphie v1 is using Symfony + PostgreSQL. This repository will be used for the v2.
The v2 will use NodeJS and will be pluggable to any DBMS.

For the moment, the code is in the **dev** branch.
