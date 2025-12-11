## Shell编程

### 1. 基本概念

#### 1.1 Shell脚本

* UNIX的哲学：一条命令只做一件事情

* 为了组合命令和多次执行，可以使用脚本文件保存需要执行的命令

  * 单行执行多条命令，使用`;` 分隔

    ```shell
    cd /var ; ls ; du *
    ```

* 执行前，需要赋予脚本文件可执行权限

  ```shell
  chmod u+x 脚本文件名
  ```

#### 1.2 脚本的格式

* 文件后缀为`.sh`
* 首行什么脚本解释器类型（Sha-Bang）

```shell
#!/bin/bash
```

* 注释使用`#`, 一般写在命令上一行，不推荐写在命令后面

#### 1.3 执行方式

* bash ./file.sh
  在终端下产生一个子进程再去运行bash解释器执行脚本

* ./file.sh

  在终端下产生一个子进程再去运行脚本中第一行指定的解释器执行脚本

* source ./file.sh

  在当前进程中执行脚本

```shell
vim 2.sh

#!/bin/bash
cd /tmp
pwd

chmod u+x 2.sh
# 下面三种方式执行脚本后观察当前终端中路径是否切换到/tmp，为什么？
bash 2.sh 
./2.sh
source 2.sh
```

#### 1.4 重定向

* 输入重定向
  
  * `<`
  * `read var < /path/to/file`
  
* 输出重定向

  * `>`, `>>`,`2>`,`&>`

  * `echo 123 > /path/to/file`

* 输入和输出组合使用

  * 常用于在shell脚本中生成配置文件使用

  ```shell
  # 多行
  cat > /path/to/file << EOF
  多行文本内容
  EOF
  
  # 例如
  cat > /etc/yum.repos.d/aaa.repo << EOF
  [centos]
  name=centos
  baseurl=http://1.1.1.1/centos
  gpgcheck=0
  enable=1
  EOF
  
  # 如果命令是交互式的，在脚本里面可以采用下面方式
  echo "888888"| passwd --stdin $USER
  
  # 单行
  echo "hello" > /path/to/file
  ```

### 2. 变量

#### 2.1 变量

* 定义

  * 字母、数字、下划线
  * 不能以数字开头

* 赋值

  * 变量名=变量值，等号左右不允许有空格
    * `a=123`
  * 将命令执行结果赋值给变量
    * `letc=$(ls -l /etc)`
    * 使用$()或者``
  * 变量的值中如果有空格等特殊字符可以包含在双引号或单引号中
    * `name="macro zhang"`

* 引用

  * ${变量名}
  * echo ${变量名} 输出变量的值
  * 在部分情况可以简写为 $变量名


#### 2.2 变量的作用范围

* 作用范围
  * 变量默认只对当前shell生效
  * 变量的导出，子进程可以读取父进程变量
    * `export`
  * 变量的删除
    * `unset`

* 系统环境变量

  * 系统环境变量就是所有shell打开都可以获得的变量

  ```shell
  env | more
  set | more
  
  echo $USER
  
  echo $PATH # 系统命令的当前搜索路径
  ```

  * 预定义变量

    * $?
      * 上一条命令是否正确执行
    * \$$ 
      * 当前进程的PID
    * $0
      * 当前进程名称

  * 位置变量

    * $1 - $9, ${10}
    * 用于读取执行脚本时的参数

    ```shell
    vim 3.sh
    
    #!/bin/bash
    pos1=$1
    pos2=${2-_} # 当没有第二个参数的时候，自动设置为_
    
    echo $pos1
    echo $pos2
    
    chmod u+x 3.sh
    ./3.sh -a -l
    ```

      * 环境变量文件
        * 所有用户使用
          * /etc/profile 
          * /etc/bashrc
        * 特定用户使用
          * ~/.bash_profile
          * ~/.bashrc
        * 执行顺序
          * login用户，即`su - root`
            * /etc/profile  -> .bash_profile -> .bashrc -> /etc/bashrc
          * nologin用户，即`su root`
            * .bashrc -> /etc/bashrc
        * 每次重新打开shell加载环境变量，不重新打开需要使用`source 环境变量文件`加载

#### 2.3 数组

* 定义数组

  ```she
  ips=(192.168.10.1 192.168.10.2 192.168.10.3)
  ```

* 显示数组所有元素

  ```shell
  echo ${ips[@]}
  ```

* 显示数组元素个数

  ```shell
  echo ${#ips[@]}
  ```

* 显示数组的第一个元素

  ```shell
  echo $ips
  echo ${ips[0]}
  ```

  

