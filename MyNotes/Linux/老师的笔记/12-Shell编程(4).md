## Shell编程（4）

### 1. 函数

#### 1.1 自定义函数

* 函数用于“包含”重复使用的命令集合
* 语法格式
  * function可以省略

```shell
function fname() {
  命令
}
```

* 执行函数

```shell
fname
```

* 案例

```shell
function cdls() {
   cd /var
   ls
}

# 使用
cdls
```

* 函数作用范围的变量
  * `local 变量名`可以声明函数内的变量，离开函数就失效了 

* 函数的参数
  * $1  $2  $3 ...
* 案例

```shell
cdls2() {
  cd $1
  ls
}

# 使用
cdls2 /tmp
```

案例2：检查进程是否存活

```shell
#!/bin/bash
checkpid() {
  local i # 防止其他人定义过变量i
  
  for i in $* ; do
    if [ ! -d "/proc/$i" ] ; then
      return 1
    fi
  done
  
  return 0
}

# 使用
source checkpid.sh # 必须使用source执行，否则子进程无法访问父进程
checkpid 1 2
```

#### 1.2 系统函数库

* 定义在/etc/init.d/functions文件中

### 2. 计划任务

#### 2.1 一次性计划任务

* at
  * 没有终端，不能进行标准输出，只能重定向到某个文件
  * 如果采用非内部命令，尽量使用完整路径
  * 如果是shell程序，使用source执行引入环境变量

```shell
date # 参看当前时间

# 如果没有安装
# 安装 yum install at -y
# 启动服务 systemctl start atd
# 创建任务
at 8:59 # 后面为任务执行时间
at> echo hello > /tmp/hello.txt
at> (Ctrl+D 提交任务)

# 查看任务
atq

# 取消任务
atrm 编号
```



#### 2.2 周期性计划任务

* cron
  * 配置方式 `crontab -e`
  * 查看现有的计划任务 `crontab -l`
  * 配置格式
    * 分钟 小时 日期 月份 星期 执行命令
    * 注意命令的路径问题、输出问题
    * 可以通过查看日志`/var/log/cron`了解任务的执行情况

```shell
# 每分钟执行一次
* * * * * /usr/bin/date >> /tmp/date.txt 

# 周1或周5每分钟执行一次
* * * * 1,5 /usr/bin/date >> /tmp/date.txt

# 周1到周5每分钟执行一次
* * * * 1-5 /usr/bin/date >> /tmp/date.txt

# 5月1日，如果是周1到周5的其中一天，每分钟执行一次
* * 1 5 1-5 /usr/bin/date >> /tmp/date.txt

# 周1凌晨3:30执行
30 3 * * 1 /usr/bin/date >> /tmp/date.txt

# 每月15日的凌晨3点执行
0 3 15 * * /usr/bin/date >> /tmp/date.txt
```

