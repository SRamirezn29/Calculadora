// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const expressionDisplay = document.getElementById('expression');
    const resultDisplay = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const scientificModeToggle = document.getElementById('scientificModeToggle');
    const calculator = document.querySelector('.calculator');
    
    // Variables de estado
    let currentExpression = '0';
    let currentResult = '0';
    let lastResult = null;
    let isScientificMode = true;
    let calculationHistory = [];
    
    // Inicializar la calculadora
    initCalculator();
    
    function initCalculator() {
        // Añadir event listeners a los botones
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', handleButtonClick);
        });
        
        // Event listener para el toggle de modo científico
        scientificModeToggle.addEventListener('change', function() {
            isScientificMode = this.checked;
            if (isScientificMode) {
                calculator.classList.add('scientific-mode');
            } else {
                calculator.classList.remove('scientific-mode');
            }
        });
        
        // Event listener para limpiar el historial
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Inicializar el modo científico
        if (isScientificMode) {
            calculator.classList.add('scientific-mode');
        }
        
        // Cargar historial desde localStorage
        loadHistory();
        
        // Actualizar la pantalla
        updateDisplay();
    }
    
    function handleButtonClick(e) {
        const button = e.currentTarget;
        const value = button.getAttribute('data-value');
        const action = button.getAttribute('data-action');
        
        if (value !== null) {
            // Es un número
            inputNumber(value);
        } else if (action) {
            // Es una acción
            handleAction(action);
        }
        
        updateDisplay();
    }
    
    function inputNumber(num) {
        if (currentExpression === '0' || currentExpression === 'Error') {
            currentExpression = num;
        } else {
            currentExpression += num;
        }
    }
    
    function handleAction(action) {
        switch (action) {
            case 'clear':
                clearCalculator();
                break;
            case 'backspace':
                backspace();
                break;
            case 'decimal':
                addDecimal();
                break;
            case 'toggleSign':
                toggleSign();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
            case 'power':
                addOperator(action);
                break;
            case 'equals':
                calculate();
                break;
            case 'openParenthesis':
                addOpenParenthesis();
                break;
            case 'closeParenthesis':
                addCloseParenthesis();
                break;
            // Funciones científicas
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'factorial':
            case 'asin':
            case 'acos':
            case 'atan':
            case 'power10':
            case 'pi':
            case 'e':
                executeScientificFunction(action);
                break;
        }
    }
    
    function clearCalculator() {
        currentExpression = '0';
        currentResult = '0';
    }
    
    function backspace() {
        if (currentExpression.length > 1) {
            currentExpression = currentExpression.slice(0, -1);
        } else {
            currentExpression = '0';
        }
    }
    
    function addDecimal() {
        // Verificar si ya hay un punto decimal en el número actual
        const tokens = currentExpression.split(/[\+\-\*\/\^\(\)]/);
        const lastToken = tokens[tokens.length - 1];
        
        if (!lastToken.includes('.')) {
            currentExpression += '.';
        }
    }
    
    function toggleSign() {
        const tokens = currentExpression.split(/(?=[\+\-\*\/\^\(\)])|(?<=[\+\-\*\/\^\(\)])/);
        const lastNumberIndex = tokens.length - 1;
        
        if (tokens[lastNumberIndex] && !isNaN(parseFloat(tokens[lastNumberIndex]))) {
            if (tokens[lastNumberIndex].startsWith('-')) {
                tokens[lastNumberIndex] = tokens[lastNumberIndex].substring(1);
            } else {
                tokens[lastNumberIndex] = '-' + tokens[lastNumberIndex];
            }
            currentExpression = tokens.join('');
        }
    }
    
    function addOperator(op) {
        const operators = {
            'add': '+',
            'subtract': '-',
            'multiply': '*',
            'divide': '/',
            'power': '^'
        };
        
        const operatorSymbol = operators[op];
        
        // Reemplazar el último operador si ya hay uno
        const lastChar = currentExpression.slice(-1);
        if (['+', '-', '*', '/', '^'].includes(lastChar)) {
            currentExpression = currentExpression.slice(0, -1) + operatorSymbol;
        } else {
            currentExpression += operatorSymbol;
        }
    }
    
    function addOpenParenthesis() {
        currentExpression += '(';
    }
    
    function addCloseParenthesis() {
        currentExpression += ')';
    }
    
    function executeScientificFunction(func) {
        const functions = {
            'sin': 'sin(',
            'cos': 'cos(',
            'tan': 'tan(',
            'asin': 'asin(',
            'acos': 'acos(',
            'atan': 'atan(',
            'log': 'log(',
            'ln': 'ln(',
            'sqrt': 'sqrt(',
            'factorial': 'factorial(',
            'power10': '10^(',
            'pi': Math.PI.toString(),
            'e': Math.E.toString()
        };
        
        if (func === 'pi' || func === 'e') {
            // Constantes
            if (currentExpression === '0' || currentExpression === 'Error') {
                currentExpression = functions[func];
            } else {
                currentExpression += functions[func];
            }
        } else {
            // Funciones
            currentExpression += functions[func];
        }
    }
    
    function calculate() {
        try {
            // Reemplazar símbolos para evaluación
            let expressionToEval = currentExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/π/g, Math.PI.toString())
                .replace(/e/g, Math.E.toString())
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/asin\(/g, 'Math.asin(')
                .replace(/acos\(/g, 'Math.acos(')
                .replace(/atan\(/g, 'Math.atan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/10\^\(/g, '10**(');
            
            // Manejar factoriales (n!)
            expressionToEval = expressionToEval.replace(/(\d+)!/g, function(match, num) {
                return factorial(parseInt(num));
            });
            
            // Manejar factorial de expresiones entre paréntesis
            expressionToEval = expressionToEval.replace(/factorial\(/g, 'factorial(');
            
            // Evaluar la expresión
            const result = evalExpression(expressionToEval);
            
            // Guardar resultado
            lastResult = result;
            currentResult = formatResult(result);
            
            // Guardar en historial
            addToHistory(currentExpression, currentResult);
            
            // Establecer la expresión al resultado para continuar calculando
            currentExpression = result.toString();
            
        } catch (error) {
            currentResult = 'Error';
            console.error('Error en cálculo:', error);
        }
    }
    
    function evalExpression(expr) {
        // Función de evaluación segura
        try {
            // Evaluar usando Function constructor (más seguro que eval directo)
            return new Function('return ' + expr)();
        } catch (error) {
            // Si falla, intentar con eval (con precauciones)
            try {
                return eval(expr);
            } catch (e) {
                throw new Error('Expresión inválida');
            }
        }
    }
    
    function factorial(n) {
        if (n < 0) throw new Error('Factorial de número negativo');
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    function formatResult(result) {
        // Redondear resultados muy largos
        if (typeof result === 'number') {
            // Si es un número muy grande o muy pequeño, usar notación científica
            if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
                return result.toExponential(6);
            }
            
            // Redondear a 10 decimales máximo
            const rounded = Math.round(result * 1e10) / 1e10;
            
            // Si es un número entero, mostrar sin decimales
            if (rounded % 1 === 0) {
                return rounded.toString();
            }
            
            // Mostrar con decimales, eliminando ceros a la derecha
            return parseFloat(rounded.toFixed(10)).toString();
        }
        return result.toString();
    }
    
    function addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        calculationHistory.unshift(historyItem);
        
        // Limitar el historial a 10 elementos
        if (calculationHistory.length > 10) {
            calculationHistory.pop();
        }
        
        // Actualizar la vista del historial
        updateHistoryDisplay();
        
        // Guardar en localStorage
        saveHistory();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        calculationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    function clearHistory() {
        calculationHistory = [];
        updateHistoryDisplay();
        saveHistory();
    }
    
    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    }
    
    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            calculationHistory = JSON.parse(savedHistory);
            updateHistoryDisplay();
        }
    }
    
    function updateDisplay() {
        expressionDisplay.textContent = currentExpression;
        resultDisplay.textContent = currentResult;
    }
    
    // Soporte para teclado
    document.addEventListener('keydown', function(e) {
        const key = e.key;
        
        // Números
        if (key >= '0' && key <= '9') {
            inputNumber(key);
            updateDisplay();
        }
        // Operadores básicos
        else if (key === '+') {
            addOperator('add');
            updateDisplay();
        }
        else if (key === '-') {
            addOperator('subtract');
            updateDisplay();
        }
        else if (key === '*') {
            addOperator('multiply');
            updateDisplay();
        }
        else if (key === '/') {
            e.preventDefault(); // Evitar que se abra la búsqueda rápida
            addOperator('divide');
            updateDisplay();
        }
        // Punto decimal
        else if (key === '.') {
            addDecimal();
            updateDisplay();
        }
        // Paréntesis
        else if (key === '(') {
            addOpenParenthesis();
            updateDisplay();
        }
        else if (key === ')') {
            addCloseParenthesis();
            updateDisplay();
        }
        // Igual / Enter
        else if (key === '=' || key === 'Enter') {
            e.preventDefault();
            calculate();
            updateDisplay();
        }
        // Escape / Borrar
        else if (key === 'Escape' || key === 'Delete') {
            clearCalculator();
            updateDisplay();
        }
        // Retroceso
        else if (key === 'Backspace') {
            backspace();
            updateDisplay();
        }
    });
});