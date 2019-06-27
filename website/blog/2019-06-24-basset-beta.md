---
title:  Version release 1.0.0-beta
author: Jeremy Gonzalez
---

I started working on Basset a few months ago, I originally wanted to render jest snapshots to see the differences between common components. As I started out playing around with different libraries I saw there wasn't a out of the box solution for catching differences, at least one that would fit my needs.
<!--truncate-->
I decided to create a platform that was first open source and secondly easy to integrate. Basset turned out to be a very fun and challenging project. It easily integrates into continuous integration (CI) pipelines. I've tried to add features which should help product teams catch un-desirable changes.

#### Some features

* Easy setup and deploy - use docker or AWS
* Ignore test flakes - maybe a change is just from a test flake, future builds will ignore flakes for a specific width and title
* Capture elements using CSS selectors
* Hide elements using CSS selectors - maybe you have a field with a timestamp? You can include the css selectors to hide elements for a specific snapshot.
* Track snapshots removed - if a snapshot was removed from a build it will show
* Github integration - login and status updates for commits
* Slack integration - notify channel users of changes from builds

I plan to continue to work on Basset, if you see any features you think are missing feel free to create an issue on the github repo.
