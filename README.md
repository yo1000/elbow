# :muscle: elbow

## Quick start

```console
$ npm install
$ DEBUG=node-test:* npm start
```

## Usage

### ALB

#### Look up names in ALB

`/elb/application`

_Example_

```console
$ curl 'http://localhost:3000/elb/application'
[{
  "Name":"alb1"
},{
  "Name":"alb2"
}]
```

#### Look up overview in ALB

`/elb/application/:name`

_Example_

```console
$ curl 'http://localhost:3000/elb/application/alb1'
{
  "Name":"alb1",
  "Instances":[{
    "Id":"i-0123456789abcdef0",
    "AZ":"ap-northeast-1c",
    "PrivateIp":"10.50.1.10",
    "PrivateDnsName":"ip-10-50-1-10.ap-northeast-1.compute.internal",
    "PublicIp":"52.198.100.100",
    "PublicDnsName":""
  },{
    "Id":"i-0123456789abcdef1",
    "AZ":"ap-northeast-1c",
    "PrivateIp":"10.50.1.11",
    "PrivateDnsName":"ip-10-50-1-11.ap-northeast-1.compute.internal",
    "PublicIp":"52.198.100.101",
    "PublicDnsName":""
  }]
}
```

### CLB

#### Look up names in CLB

`/elb/classic`

_Example_

```
$ curl 'http://localhost:3000/elb/classic'
[{
  "Name":"clb1"
},{
  "Name":"clb2"
}]
```

#### Look up overview in CLB

`/elb/classic/:name`

_Example_

```
$ curl 'http://localhost:3000/elb/classic/clb1'
{
  "Name":"clb1",
  "Instances":[{
    "Id":"i-0123456789abcdef2",
    "AZ":"ap-northeast-1c",
    "PrivateIp":"10.50.1.20",
    "PrivateDnsName":"ip-10-50-1-20.ap-northeast-1.compute.internal",
    "PublicIp":"52.198.100.200",
    "PublicDnsName":""
  },{
    "Id":"i-0123456789abcdef3",
    "AZ":"ap-northeast-1c",
    "PrivateIp":"10.50.1.21",
    "PrivateDnsName":"ip-10-50-1-21.ap-northeast-1.compute.internal",
    "PublicIp":"52.198.100.201",
    "PublicDnsName":""
  }]
}
```

### Utility

#### Set property name as narrowing condition

`/elb/application/:name?props=<PropertyName>`
`/elb/classic/:name?props=<PropertyName>`

_Example_

```console
$ curl 'http://localhost:3000/elb/application/alb1?props=Instances.PrivateIp'
{
  "Instances.PrivateIp":[
    "10.50.1.10",
    "10.50.1.11"
  ]
}
```

#### Get output in text format

`/elb/application/:name?props=<PropertyName>&format=text`
`/elb/classic/:name?props=<PropertyName>&format=text`

_Example_

```console
$ curl 'http://localhost:3000/elb/application/alb1?props=Instances.PrivateIp&format=text'
10.50.1.10
10.50.1.11
```
