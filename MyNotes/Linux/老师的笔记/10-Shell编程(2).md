## Shell编程（2）

### 1. 运算符

#### 1.1 赋值运算符

* = 
* 用于算术赋值和字符串赋值
* 测试操作符
* 使用unset取消变量

#### 1.2 算术运算符

* +，++

* -，--

* *

* /

* **(乘方)

* %(求余)

* 使用expr进行运算

  * 只能支持整数
  * expr 是一条命令
  * 书写格式苛刻，不常用
  
  ```shell
  expr 4 + 5 # 运算符左右需要空格
  
  num1=`expr 4 + 5`
  echo $num1
  
  name=zhangsan
  len=`expr length $name`
  echo $len
  ```

#### 1.3 双圆括号

* 是let命令的简写

* 注意做赋值和输出时需要在外面加`$`

* 最常用

  ```shell
  ((a=10))
  ((a++))
  echo $((10+20))
  
  ((a=4+5))
  echo $a
  # 如果是下面写法呢
  b=4+5
  echo $b
  ```

#### 1.4 比较运算符

* <, > , = 
* <= , >= , !=
* 0 True
* 非零 False

```shell
((5>4))
echo $?
# 真为0值

((5<4))
echo $?
# 假为非0值
```

#### 1.5 逻辑运算符

* &&  ||  ！

```shell
(( 5>4 && 6>5 ))
echo $?
```

### 2. 测试和判断

#### 2.1 test

* 用于检查文件或者比较值
* test可以做以下测试
  * 文件测试
  * 整数比较测试
  * 字符串测试
* 可以简化为[]
* []还有扩展写法为[[]]，支持&&，||，<，>

* 至少要有一个空格

```shell
# 是否存在且是文件
test -f /etc/passwd
# 等价 [ -f /etc/passwd ]

# 是否存在且是目录
test -d /etc
# 等价 [ -d /etc ]

# 是否存在
test -e /etc
# 等价 [ test -e /etc ]

# 字符串长度是否为0（为0则表达式成立）
test -z hello
# 等价 [ test -z hello ]

# 判断数字
[ 5 -gt 4 ]
# 等价 [[ 5 > 4 ]]
# -gt >
# -lt <
# -eq =
# -ge >=
# -le <=

# 判断字符串
[ "abc" = "abc" ]
# 区分大小写
[ "abc" = "Abc" ]
```

#### 2.2 if条件语句

* 基本语法

```shell
if [ 测试条件成立 ] 或者使用命令返回0值
then
  执行命令
fi
```

* 案例

```shell
if [ $UID = 0 ]
then
  echo "you are root"
fi

if pwd
then
  echo "pwd is running"
fi
```

#### 2.3 if-then-else语句

* 基本语法

```shell
if [ 测试条件成立 ]
then
  执行命令
else
  执行条件不成功的命令
fi
```

* 案例

```shell
#!/bin/bash

# if-else的使用
if [ $USER = root ] ;then
  echo "you are root"
  echo $UID
else
  echo "you are other"
  echo $UID
fi
```

#### 2.4 if-elif-else语句

* 基本语法

```shell
if [ 测试条件成立 ]
then
  执行命令
elif [ 测试条件成立 ]
then
  执行命令
else
  执行命令
fi
```

* 案例

```shell
#!/bin/bash

# if-elif-else的使用
if [ $USER = root ] ; then
  echo "you are root"
elif [ $USER = chendong ] ; then
  echo "you are chendong"
else
  echo "you are other"
fi
```

#### 2.5 if嵌套

* 案例

```shell
#!/bin/bash

if [ $UID = 0 ] ;then
  echo "please run"
  if [ -x /root/shell/5.sh ] ;then
    bash /root/shell/5.sh
  fi
else
  echo "switch root user"
fi
```

#### 2.6 case分支

* 基本语法

```shell
case "$变量" in
  "情况1")
    执行命令  ;;
  "情况2")
    执行命令  ;;
  *)
    执行命令  ;;
esac
```

* 案例

./start_service.sh abc

```shell
#!/bin/bash

# 注意：判断条件中的字符串一定要使用双引号
case "$1" in
  "start"|"START")
    echo "start application"  
    echo "applicaion is running" 
    ;;
  "stop"|"STOP")
    echo "stop application"  
    echo "applicaion is stopped" 
    ;;
  *)
    echo "unknow option"
    echo "Usage: $0 {start|stop}"  
    ;;
esac
```



