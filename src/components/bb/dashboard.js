
function getInfo(data){
    var wrapper = document.createElement('DIV')
    wrapper.classList.add('ge-info-detail')

    wrapper.append(dataRow('Schälprozent', data.agg['2021'].ivus_schaele + '%'))
    wrapper.append(getRange(data.agg['2021'].ivus_schaele));

    wrapper.append(dataRow('Verbissprozent', data.agg['2021'].ivus_verbiss + '%'))
    wrapper.append(getRange(data.agg['2021'].ivus_verbiss));
    

    return wrapper;
}

function getRange(percent){
    var wrapper = document.createElement('DIV')
    wrapper.classList.add('ge-info-range', 'ge-row', 'even')

    var indicator = document.createElement('DIV')
    indicator.classList.add('ge-info-range-indicator')
    indicator.style.left = Math.max(0, Math.min(100, percent)) + '%';
    wrapper.append(indicator);

    var qual1 = document.createElement('DIV')
    qual1.classList.add('ge-info-range-qual1', 'ge-grow')
    wrapper.append(qual1);

    var qual2 = document.createElement('DIV')
    qual2.classList.add('ge-info-range-qual2', 'ge-grow')
    wrapper.append(qual2);

    var qual3 = document.createElement('DIV')
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

export { getInfo, getRange };