/**
 * Application Load Balancer
 */
class Alb {
    constructor(awsApi) {
        this.ec2 = new awsApi.EC2();
        this.elb2 = new awsApi.ELBv2();
    }

    /**
     *
     * @returns {Promise.<Object[]>} LoadBalancerNames
     */
    describeLoadBalancerNames() {
        return new Promise((resolve, reject) => {
            this.elb2.describeLoadBalancers((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.LoadBalancers.map(loadBalancer => {
                        return {"Name": loadBalancer.LoadBalancerName};
                    }));
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param loadBalancerName
     * @returns {Promise.<Object[]>} LoadBalancedInstanceIds
     */
    describeLoadBalancedInstances(loadBalancerName) {
        return (async () => {
            try {
                const instanceIds = this._describeInstanceIds();
                const loadBalancerArn = this._describeLoadBalancerArn(loadBalancerName);
                const listenerArn = this._describeListenerArn(await loadBalancerArn);
                const targetGroupArn = this._describeTargetGroupArn(await listenerArn);
                const targetHealthInstanceIds = this._describeTargetHealthInstanceIds(await targetGroupArn, await instanceIds);
                const instances = this._describeInstances(await targetHealthInstanceIds);
                return await instances;
            } catch (err) {
                console.error("%O", err);
                throw new Error(err);
            }
        })();
    }

    /**
     *
     * @returns {Promise.<String>} InstanceIds
     * @private
     */
    _describeInstanceIds() {
        return new Promise((resolve, reject)　=> {
            this.ec2.describeInstances({
                "MaxResults" : 1000
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Reservations.map((reservation) => {
                        return reservation.Instances.map((instance) => {
                            return instance.InstanceId;
                        });
                    }).reduce((prev, current) => {
                        return prev.concat(current);
                    }));
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param loadBalancerName
     * @returns {Promise.<String>} LoadBalancerArn
     * @private
     */
    _describeLoadBalancerArn(loadBalancerName) {
        console.log("loadBalancerName: %O", loadBalancerName);
        return new Promise((resolve, reject) => {
            this.elb2.describeLoadBalancers({
                "Names": [loadBalancerName]
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.LoadBalancers[0].LoadBalancerArn);
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param loadBalancerArn
     * @returns {Promise.<String>} ListenerArn
     * @private
     */
    _describeListenerArn(loadBalancerArn) {
        console.log("loadBalancerArn: %O", loadBalancerArn);
        return new Promise((resolve, reject) => {
            this.elb2.describeListeners({
                "LoadBalancerArn": loadBalancerArn
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Listeners[0].ListenerArn);
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param listenerArn
     * @returns {Promise.<String>} TargetGroupArn
     * @private
     */
    _describeTargetGroupArn(listenerArn) {
        console.log("listenerArn: %O", listenerArn);
        return new Promise((resolve, reject) => {
            this.elb2.describeRules({
                "ListenerArn": listenerArn
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Rules[0].Actions[0].TargetGroupArn);
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param targetGroupArn
     * @param instanceIds
     * @returns {Promise.<String[]>} InstanceIds
     * @private
     */
    _describeTargetHealthInstanceIds(targetGroupArn, instanceIds) {
        console.log("targetGroupArn: %O", targetGroupArn);
        console.log("instanceIds: %O", instanceIds);
        return new Promise((resolve, reject) => {
            this.elb2.describeTargetHealth({
                "TargetGroupArn" : targetGroupArn,
                "Targets" : instanceIds.map(id => {
                    return {"Id" : id};
                })
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.TargetHealthDescriptions.filter(instance => {
                        return instance.TargetHealth.State !== 'unused';
                    }).map(instance => {
                        return instance.Target.Id;
                    }));
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }

    /**
     *
     * @param instanceIds
     * @returns {Promise.<Object[]>} Instances
     * @private
     */
    _describeInstances(instanceIds) {
        return new Promise((resolve, reject)　=> {
            this.ec2.describeInstances({
                "Filters" : [{
                    "Name" : "instance-id",
                    "Values" : instanceIds
                }],
                "MaxResults" : 1000
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Reservations.map((reservation) => {
                        return reservation.Instances.map((instance) => {
                            return {
                                "Id" : instance.InstanceId,
                                "AZ" : instance.Placement.AvailabilityZone,
                                "PrivateIp" : instance.PrivateIpAddress,
                                "PrivateDnsName" : instance.PrivateDnsName,
                                "PublicIp" : instance.PublicIpAddress,
                                "PublicDnsName" : instance.PublicDnsName
                            };
                        });
                    }).reduce((prev, current) => {
                        return prev.concat(current);
                    }));
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }
}

module.exports.Alb = Alb;
