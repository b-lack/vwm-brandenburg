import {Chart, registerables} from 'chart.js'
Chart.register(...registerables);


let OBFCHART = null;
let REVIERCHART = null;

class Dashboard {
    constructor(removeLayer) {
        this.wrapper = document.createElement('DIV');
        this.wrapper.classList.add('ge-info-window')
        this.removeLayer = removeLayer

        this.init();
    }
    init(){
        let infoLine = document.createElement('DIV');
        infoLine.classList.add('ge-row', 'ge-selection');
        this.titleElement = document.createElement('DIV');
        infoLine.append(this.titleElement);
        let obfClose = document.createElement('DIV');
        obfClose.innerHTML = '&#x2715;';
        obfClose.addEventListener('click', () => this.removeLayer('9'));
        infoLine.append(obfClose);
        this.wrapper.append(infoLine);

        /*let infoContent = document.createElement('DIV');
        infoContent.classList.add('ge-info-content');
        let canvas = document.createElement('CANVAS');
        canvas.setAttribute('width', '200')
        canvas.setAttribute('height', '200')
        infoContent.append(canvas);
        this.wrapper.append(infoContent);*/

        this.wrapper.append(this.getInfo({}));

        
    }

    getInfo(data){
        const wrapper = document.createElement('DIV')
        wrapper.classList.add('ge-info-detail')

        const wrapper1 = document.createElement('DIV')

        this.schaelProzValue = dataRow('Schälprozent', (data.agg ? data.agg['2021'].ivus_schaele : 0) + '%');
        wrapper1.append(this.schaelProzValue)
        this.schaelProz = getRange(data.agg ? data.agg['2021'].ivus_schaele : 0);
        wrapper1.append(this.schaelProz);

        wrapper.append(wrapper1);

        const wrapper2 = document.createElement('DIV')

        this.verbissProzValue = dataRow('Verbissprozent', (data.agg ? data.agg['2021'].ivus_verbiss : 0) + '%');
        wrapper2.append(this.verbissProzValue)
        this.verbissProz = getRange(data.agg ? data.agg['2021'].ivus_verbiss : 0);
        wrapper2.append(this.verbissProz);

        wrapper.append(wrapper2);
        
        const canvasWrapper = document.createElement('DIV')
        wrapper.append(canvasWrapper);

        return wrapper;
    }
    
    getWrapper(){
        return this.wrapper;
    }
    updateInfo(data){
        this.titleElement.innerText = data.name;
        this.schaelProz.getElementsByClassName('ge-info-range-indicator')[0].style.left = Math.max(0, Math.min(100, data.agg['2021'].ivus_schaele)) + '%';
        this.verbissProz.getElementsByClassName('ge-info-range-indicator')[0].style.left = Math.max(0, Math.min(100, data.agg['2021'].ivus_verbiss)) + '%';
        this.schaelProzValue.getElementsByClassName('ge-row-value')[0].innerText = data.agg['2021'].ivus_schaele + '%';
        this.verbissProzValue.getElementsByClassName('ge-row-value')[0].innerText = data.agg['2021'].ivus_verbiss + '%';
    }
    hide(){
        this.wrapper.classList.add('hidden');
    }
    show(){
        this.wrapper.classList.remove('hidden');
    }


}

/*function getInfo(data){

    const wrapper = document.createElement('DIV')
    wrapper.classList.add('ge-info-detail')

    const wrapper1 = document.createElement('DIV')

    wrapper1.append(dataRow('Schälprozent', data.agg['2021'].ivus_schaele + '%'))
    wrapper1.append(getRange(data.agg['2021'].ivus_schaele));

    wrapper.append(wrapper1);

    const wrapper2 = document.createElement('DIV')

    wrapper2.append(dataRow('Verbissprozent', data.agg['2021'].ivus_verbiss + '%'))
    wrapper2.append(getRange(data.agg['2021'].ivus_verbiss));

    wrapper.append(wrapper2);
    
    const canvasWrapper = document.createElement('DIV')
    wrapper.append(canvasWrapper);

    return wrapper;
}*/

function getRange(percent){
    const wrapper = document.createElement('DIV')
    wrapper.classList.add('ge-info-range', 'ge-row', 'even')

    const indicator = document.createElement('DIV')
    indicator.classList.add('ge-info-range-indicator')
    indicator.style.left = Math.max(0, Math.min(100, percent)) + '%';
    wrapper.append(indicator);

    const qual1 = document.createElement('DIV')
    qual1.classList.add('ge-info-range-qual1', 'ge-grow')
    wrapper.append(qual1);

    const qual2 = document.createElement('DIV')
    qual2.classList.add('ge-info-range-qual2', 'ge-grow')
    wrapper.append(qual2);

    const qual3 = document.createElement('DIV')
    qual3.classList.add('ge-info-range-qual3', 'ge-grow')
    wrapper.append(qual3);

    return wrapper;
}

function dataRow(title, value){
    var wrapper = document.createElement('DIV')
    wrapper.classList.add('ge-row')

    const titel = document.createElement('DIV')
    titel.classList.add('ge-grow', 'ge-row-title')
    titel.innerText = title
    wrapper.append(titel);

    const val = document.createElement('DIV')
    val.classList.add('ge-row-value')
    val.innerText = value
    wrapper.append(val);

    return wrapper;
}

function treeSpecies(data, labels, canvas){
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                //label: '# of Votes',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

export {Dashboard, getRange, treeSpecies };