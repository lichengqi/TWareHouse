var $ = require('./$');

function factory () {
    function QuestionParser (unique, subject_id, dom) {
        var me = this;
        me.unique = unique;
        me.subject_id = subject_id;
        if (!dom || dom.length <= 0) {
            throw new Error('not dom', me.unique, e.message);
        }
        me.dom = dom;
    }
    QuestionParser.prototype.parse = function () {
        var me = this, question = me.question = {
            body: '',
            answer: '',
            explanation: '',
            choice_answer: '',
            subject_id: me.subject_id,
            unique: me.unique,
            available: 1,
            knowledge: ''
        };
        try {
            question.question_type = me.getType();
        } catch (e) {
            console.log('error when parse question type', me.unique, e.message);
        }
        try {
            question.use = me.getUse();
        } catch (e) {
            console.log('error when parse use', me.unique, e.message);
        }
        try {
            question.difficulty = me.getDifficulty();
        } catch (e) {
            console.log('error when parse difficulty', me.unique, e.message);
        }
        try {
            question.knowledge = me.getKnowledge();
        } catch (e) {
            console.log('error when parse knowledge', me.unique, e.message);
        }
        question.body = me.getBody();
        try {
            var answer = me.getAnswer() || {};
            question.answer = answer.answer;
            question.explanation = answer.explanation;
            question.choice_answer = answer.choice_answer;
        } catch (e) {
            console.log('error when parse answer', me.unique, e.message);
        }
        return question;
    };
    QuestionParser.prototype.getType = function () {
        if (this.dom.find('.pt2').length > 0) {
            return 1;
        }
        if (this.dom.find(".quizPutTag").length > 0) {
            return 2;
        }
        return 4;
    };
    QuestionParser.prototype.getUse = function () {
        var user1 = Number(this.dom.find('.fieldtip label:eq(1) em').text()) || 0;
        var user2 = Number(this.dom.find('.fieldtip label:eq(2) em').text()) || 0;
        return 2 * user1 + user2;
    };
    QuestionParser.prototype.getDifficulty = function () {
        var diff = Number(this.dom.find('.fieldtip label:eq(0) em').text()) || 0.5;
        return Math.ceil(diff / 0.2);
    };
    QuestionParser.prototype.getKnowledge = function() {
        var knowledges = [];
        this.dom.find(".pt3").find("a").each(function() {
            knowledges.push($(this).text() || "");
        });
        return knowledges.join("@!");
    };
    QuestionParser.prototype.getBody = function () {
        var me = this;
        var pt1 = me.dom.find('.pt1');
        var pt2 = me.dom.find('.pt2 > table.ques');
        var body = $('<div>');
        pt1.contents().each(function () {
            if (this.nodeType == this.COMMENT_NODE) {
                return;
            }
            var child = $(this);
            if (this.nodeType == this.TEXT_NODE) {
                body.append($('<span>').html(child.text()));
            }
            if (child.is('.qseq, .sanwser')) {
                return;
            }
            if (child.is('a')) {
                body.append($('<span>').html(child.html()));
                return;
            }
            if (child.hasClass('quizPutTag')) {
                body.append($('<span x-underline>&nbsp;</span>'));
                return;
            }
            body.append(child.prop('outerHTML'));
        });
        if (pt2.length > 0) {
            var optionBody = getOptionBody(pt2);
            body.append(optionBody);
        }
        removeTag(body);
        if (body.contents().length <= 0) {
            throw new Error("body is empty ");
        }
        body = body.prop('outerHTML');
        body = (body || "").replace(/\s+/mg, ' ');
        return body;
    };
    function removeTag (body) {
        body.find('.MathJye').each(function () {
            var math = $(this);
            removeAttributes(math);
            math.addClass('formula');
        });
        body.find('.MathJye_mi').removeClass('.MathJye_mi').addClass('formula_mi');
        body.find('img').attr('alt', null);
    }
    function getOptionBody (option) {
        option = option.clone();
        removeAttributes(option);
        option.find('td.selectoption').each(function () {
            var td = $(this);
            removeAttributes(td);
            var td1 = $('<div>');
            var first = true;
            td.children().contents().each(function () {
                if (this.nodeType == this.COMMENT_NODE) {
                    return;
                }
                var child = $(this);
                if (this.nodeType == this.TEXT_NODE) {
                    if (!child.text()) {
                        return;
                    }
                    if (first) {
                        first = false;
                        var match = child.text().trim().match(/^([A-Z]?)\s*[\.\．]*\s*(.*)/);
                        var option = match && match[1] || '', text = match && match[2] || '';
                        td1.append($('<span x-option>').html(option));
                        td1.append($('<span>').html(text));
                    } else {
                        td1.append($('<span>').html(child.text()));
                    }
                    return;
                }
                td1.append(child.prop('outerHTML'));
            });
            td.html(td1.html());
        });

        return option;
    };
    QuestionParser.prototype.getAnswer = function () {
        var me = this;
        var explanation = me.dom.find('.pt6').clone(), answer = '', answer_option = '';
        if (explanation.find('.mustvip').length > 0) {
            console.log('must vip for', me.unique);
            return;
        }
        explanation = explanation.contents().map(function () {
            if (this.nodeType != this.COMMENT_NODE && !(this.tagName == 'EM' && /解答/.test($(this).text()))) return this;
        });
        explanation = $('<div>').append(explanation);
        removeTag(explanation);
        explanation = explanation.prop('outerHTML');
        var underlines = me.dom.find('.pt1 .quizPutTag'), options = me.dom.find('.pt2 .selectoption');
        if (underlines.length > 0) {
            answer = $('<div>');
            underlines.each(function () {
                answer.append($(this).html());
                answer.append('<br />');
            });
            removeTag(answer)
            answer = answer.prop('outerHTML');
        } else if (options.length > 0) {
            options.each(function () {
                var child = $(this).children();
                if (child.hasClass('s')) {
                    var match = child.text().trim().match(/^([A-Z]?)\s*[\.\．]*\s*(.*)/);
                    var option = match && match[1];
                    if (option) {
                        if (answer_option) answer_option +=',';
                        answer_option += option;
                    }
                }
            });
            answer = answer_option;
        }
        return { answer: (answer || '').replace(/\s+/mg, ' '), choice_answer: answer_option, explanation: (explanation || '').replace(/\s+/mg, ' ') };
    };
    function removeAttributes (dom) {
        dom.each(function () {
            while(this.attributes.length > 0)
                this.removeAttribute(this.attributes[0].name);
        });
    }
    return QuestionParser;
}

module.exports = factory();
