cfail
=====

Cfail is a exception monitoring system

网站的前端运行期异常收集和分析服务，作为前端生态环境的重要一环，往往被人忽视，缺失异常收集的网站是不健康的，所以个人参考市面上已有的appfail.net，使用Node.js做了个，希望先在公司内部使用起来。

Demo: [http://cfail.herokuapp.com/demo]()

简单指南
-------

### 错误收集方式

 - `window.onerror`
 - `XMLHttpRequest`

### 采集的错误信息

 - 异常的提示信息
 - 发生异常的浏览器
 - 堆栈信息
 - 发生异常的页面路径


### 使用

 - 把cfail架设到自己的公司内的服务器上
 - 项目负责人注册个帐号，然后把项目成员的邮件地址添加到协作者名单，验证邮件会发送给协作者，里面有密码，点击链接验证后就可以用登录了
 - 再在cfail->report下设置当有异常时发送邮件到哪个给定的邮件
 - 项目成员在收到异常通知邮件后，可以查看异常的详情，解决好后把这个异常设置为fixed


开始使用
-------

### 配置环境

Ansible playbook `deployment/provision.yml` 用来配置环境：

 - 安装node.js、mongodb
 - 安装测试用的phantomjs
 - 安装bower、sails、pm2、grunt-cli等全局的npm包
 - 创建项目使用的mongodb用户和数据库

修改`deployment/hosts`里服务器的地址，然后

    ansible-playbook -i deployment/hosts -u vagrant -K -l webservers_staging deployment/provision.yml



### 本地运行/部署

修改`config`目录下的配置文件，配置下数据库、服务器端口等信息

    ansible-playbook -i deployment/hosts -u vagrant -K -l webservers_staging deployment/deploy.yml

测试
---

### 本地测试:

有两种级别的测试:

 - 前端单元测试 `npm run test_frontend`
 - 后端测试 `npm test`

### 集成测试

使用基于Node.js的 [Concrete][] CI服务器

    ansible-playbook -i deployment/hosts -u vagrant -K deployment/ci.yml

[Concrete]: https://github.com/ryankee/concrete