const express = require('express');
const router = express.Router();

const path = require('path');
const appDir = `${path.dirname(require.main.filename)}/..`;

const resFormat = require(`${appDir}/middlewares/response-formatter.js`);
const awsAlb = require(`${appDir}/middlewares/aws/alb.js`);

process.on('unhandledRejection', console.dir);

/* GET elb. */
router.get('/', function(req, res) {
    (async () => {
        try {
            res.json(await new awsAlb.Alb(AWS).describeLoadBalancerNames());
        } catch (err) {
            console.error("%O", err);
            res.status(400).json({"message" : err.message});
        }
    })();
});

/* GET specified elb. */
router.get('/:name', (req, res) => {
    (async () => {
        try {
            const loadBalancerName = req.params.name;
            const loadBalancedInstances = new awsAlb.Alb(AWS)
                .describeLoadBalancedInstances(loadBalancerName);

            const loadBalancer = {
                "Name" : loadBalancerName,
                "Instances" : await loadBalancedInstances
            };

            if (req.query.props) {
                const formatter = new resFormat.ResponseFormatter(
                    req.query.props, req.query.format);
                const out = formatter.format(loadBalancer);

                if (req.query.format && req.query.format === "text") {
                    res.send(await out);
                } else {
                    res.json(await out);
                }
            } else {
                res.json(loadBalancer);
            }
        } catch (err) {
            console.error("%O", err);
            res.status(400).json({"message" : err.message});
        }
    })();
});

module.exports = router;
