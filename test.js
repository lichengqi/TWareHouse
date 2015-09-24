/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
// min = |num1 + num2 + num3 - target|;
var threeSumClosest = function(nums, target) {
    var length = nums.length,
    	min, i, j, k, sum, negative = false;
    if (nums.length < 3) {
    	return 0;
    }
    min = nums[0] + nums[1] + nums[2];
    if (min < 0) {
    	negative = true;
    	min = -min;
    }
    for (i = 0; i < length - 2; i++) {
    	for (j = i + 1; j < length; j++) {
    		for (k = j + 1; k < length; k++) {
    			sum = nums[i] + nums[j] + nums[k] - target;
    			if (sum < 0 && min > -sum) {
    				min = -sum;
    				negative = true;
    			}
    			else if (sum >= 0 && min > sum) {
    				min = sum;
    				negative = false;
    			}
    		}
    	}
    }
    if (negative) {
    	return target - min;
    }
    else {
    	return target + min;
    }
};


