## Shell编程（3）

### 1. 循环

#### 1.1 使用for遍历命令的执行结果

* 基本语法

```shell
for 参数 in 列表
do
  执行命令
done
```

* 使用for遍历命令的执行结果
  * 和if一样，也可以使用反引号或$() 方式执行命令，将命令的结果当做列表进行处理

```shell
# 批量修改文件后缀
# basename命令用于去掉文件后缀，取出文件名。
# 用法：basename a.mp3 .mp3

for filename in `ls *.mp3` ; do
  name=$(basename $filename .mp3)
  mv $filename $name.mp4
done
```

* 使用for遍历变量和文件
  * 列表中包含多个变量，变量用空格分隔
  * 对文本处理，使用文本查看命令取出文件内容
    * 默认逐行处理，如果文本中出现空格会当做多行处理

```shell
# 使用数组
for i in {1..9} ; do
  echo $i
done

# 为文件中用户分别创建目录

for name in `cat names.txt`; do
  mkdir /home/$name
done

# 写一个清理脚本
```

#### 1.2 while

* 基本语法

```shell
while test测试是否成立
do
  执行命令
done
```

* 死循环

```shell
while test测试一直成立
do
  执行命令
done
```

* test测试一直成立
  * 命令执行成功

  * 空语句`while :`

```shell
while : ; do
  echo always
done
```



#### 1.3 until

* 基本语法

  until循环与while循环相反，循环测试为假时，执行循环，为真时循环停止

```shell
until test测试为假
do 
  执行命令
done
```

* 案例

```shell
until [ 5 -lt 4 ] ; do 
  echo always
done
```

#### 1.4 break和continue

* 循环可以嵌套
* 循环也可以和判断嵌套

```shell
# 检查/etc/profile.d下的sh脚本，并执行
for sc_name in /etc/profile.d/*.sh
do
  # echo $sc_name
  if [ -x $sc_name] ; then
    . $sc_name
  fi
done
```

* 循环可以使用break和continue语句在循环中退出

```shell
for num in {1..9}
do
  if [ $num -eq 5 ] ; then
    break # 换成continue呢
  fi
  echo $num
done
```

#### 1.5 使用循环处理位置参数

* 命令行参数使用$1 $2 读取
* $0 代表脚本名称
* $*和 $@ 代表所有位置参数
* $# 代表位置参数的数量

```shell
# 发现help参数，并输出两次

for pos in $*
do
  if [ "$pos" = "help" ] ; then
    echo $pos $pos
  fi
done

# while改写
while [ $# -ge 1 ]
do
  if [ "$1" = "help" ] ; then
    echo $1 $1
  fi
  shift
done
```

