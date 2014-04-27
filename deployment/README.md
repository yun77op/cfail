该目录包含使用[Ansible][]持续集成和部署的配置

## 包含的内容

* __CI服务器配置__: 使用基于Node.js的 [Concrete][] CI服务器
* __Staging和production服务器provision配置__: Provision只跑一次，配置下所需的环境
* __Staging和production服务器deploy配置__: Deploy每次有代码更新要部署都跑一次

[Ansible]: http://www.ansible.com/
[Concrete]: https://github.com/ryankee/concrete

## 开始使用

### CI服务器配置

    ansible-playbook -i deployment/hosts -u vagrant -K deployment/ci.yml

### Provision to staging servers

    ansible-playbook -i deployment/hosts -u vagrant -K -l webservers_staging deployment/provision.yml

### Deploy to staging servers

    ansible-playbook -i deployment/hosts -u vagrant -K -l webservers_staging deployment/deploy.yml