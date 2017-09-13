/**
 * Classic Load Balancer
 */
class Clb {
    constructor(AWS) {
        this.elb = new AWS.ELB();
    }

    /**
     * Refs:
     * - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#describeLoadBalancers-property
     *
     * @returns {Promise.<Object[]>} LoadBalancerNames
     */
    describeLoadBalancerNames() {
        return new Promise((resolve, reject) => {
            this.elb.describeLoadBalancers((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.LoadBalancerDescriptions.map(loadBalancer => {
                        return {"Name" : loadBalancer.LoadBalancerName};
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
                const instanceIds = this._describeInstanceIds(loadBalancerName);
                const instances = this._describeInstances(await instanceIds);
                return await instances;
            } catch (err) {
                console.error("%O", err);
                throw new Error(err);
            }
        })();
    }

    /**
     * Refs:
     * - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#describeLoadBalancers-property
     *
     * @param loadBalancerName
     * @returns {Promise.<String[]>} InstanceIds
     * @private
     */
    _describeInstanceIds(loadBalancerName) {
        return new Promise((resolve, reject)　=> {
            this.elb.describeLoadBalancers({
                "LoadBalancerNames" : [loadBalancerName]
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.LoadBalancerDescriptions.map(loadBalancer => {
                        return loadBalancer.Instances.map(instance => {
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
     * @param instanceIds
     * @returns {Promise.<Object[]>} Instances
     * @private
     */
    _describeInstances(instanceIds) {
        return new Promise((resolve, reject)　=> {
            new AWS.EC2().describeInstances({
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

module.exports.Clb = Clb;
