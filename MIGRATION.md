# Migration to one application

Imported on 2026-10-23 from these source commits:

| Repository | Source commit | Destination |
| --- | --- | --- |
| breaze | 5b1b6d7658d3f455f1ea31947ac1238fe3f35747 | src/practices/breaze |
| emdrdot | dc4d0329f238bca67479b7751843c59bcdf27de3 | src/practices/emdrdot |
| underground | 05e58d2163cedc68bb9c2ae4a188e2fb1f7cf361 | src/practices/underground |
| ui | c8906f05429099445a13f66a326a9c96c17d37f4 | packages/ui |

The source repositories and their histories are retained. Development now happens
here; the old repositories are not synchronized with new changes.

## Hosting cutover

Deploy and verify this application's catalog and three practice entries first.
Then disable each old practice's publishing workflow and remove its GitHub Pages
site. Otherwise project Pages sites can shadow the same paths on the main domain.
Keep Pages enabled in this repository, including its `terapevti4no.space` custom
domain. The old UI repository has no role in the new build.

The original practice deployments can be restored from their retained repositories
if rollback is needed. Re-enable their workflows and Pages only when deliberately
switching those paths back; this repository's old standalone catalog is also
available in Git history before the migration commit.
