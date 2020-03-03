// BUDGET CONTROLLER

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentages = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, dataArrayLength;

            dataArray = data.allItems[type];

            //Create unique new ID
            ID = dataArray.length > 0 ? dataArray[dataArray.length - 1].id + 1 : 0;

            //Create new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            //push to data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);

            }

        },
        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            return data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },
        test: function () {
            console.log(data);
        }
    }
})();

//UI CONTROLLER

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {

        if (num == 0) {
            return num.toFixed(2);
        }

        var numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1]

        return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // either income or expenses
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHTML, element;
            //crwate HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'
            }
            else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }

            //replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));


            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)

        },
        deleteListItem: function (selectorId) {
            var el;
            el = document.getElementById(selectorId)
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields;

            fields = [...document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue)];

            fields
                .forEach(function (current, index, array) {
                    current.value = "";
                });

            fields[0].focus();


        },
        displayBudget: function (obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }

        },
        displayPercentages: function (percentages) {
            var fields;

            fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index]) {
                    current.textContent = percentages[index] + '%';

                } else {
                    current.tectContent = '---'
                }
            })

        },
        displayMonth: function () {
            var now, months, year, month;
            now = new Date();

            months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        changeType: function () {
            var fields;

            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');

        },
        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();

// GLOBAL APP CONTROLLER

var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var DOMStrings = uiCtrl.getDOMstrings()

        document.querySelector(DOMStrings.inputButton).addEventListener('click', ctrlAddItem)
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOMStrings.inputType).addEventListener('change', uiCtrl.changeType)
    }


    var updateBudget = function () {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI
        uiCtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        var percentages;

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        uiCtrl.displayPercentages(percentages)
    }


    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the field input data         
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. clear fields
            uiCtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        }

    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitID, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID)

            //2. delete the item from the UI
            uiCtrl.deleteListItem(itemId)

            //3. update and show the new budget
            updateBudget();

            // 4. Calculate and update the percentages
            updatePercentages();

        }

    }

    return {
        init: function () {
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();