import React, { Component } from 'react'
import './App.css'
import {tableData} from "./faker";
import _  from "lodash";
import TextField from '@material-ui/core/TextField';

// Колонки таблицы
// const tableColumns = {
//     visitDate: 'Дата и время визита',
//     activityLevel: 'Активность',
//     activityTime: 'Время на сайте',
//     visitCount: 'Просмотры',
//     searchPhrase: 'Фраза',
//     gender: 'Пол',
//     address: 'Почтовый индекс',
//     country: 'Страна'
// }

// Генерация таблицы
class TableMain extends Component {
    state = {
        originalResults: [],
        displayResults: [],
        sortBy: null,
        sortAsc: true
    };

    componentDidMount() {
        this.setState({ originalResults: tableData, displayResults: tableData });
    }


    filterResults = (query, results, id) => {
        return results.filter(row => {
            let tableRow = row[id];

            if (typeof tableRow === 'number') {
                query=parseInt(query);
                return query===tableRow
            }

            if (typeof tableRow === 'string') {
                // Ищет только в lowercase, заглавные буквы не жует, нужно исправить как время будет
                return tableRow.toLowerCase().includes(query)
            }
        });
    };

    onChange = e => {
        const query = e.target.value;

        this.setState(prevState => ({
            displayResults:
                query.length > 0
                    ? this.filterResults(query, prevState.originalResults, e.target.id)
                    : prevState.originalResults
        }));
    };

//   Костыльная сортировка, не смог довести до ума
    sortResults = event => {
//       Добавляю в sortBy название сортируемого столбца
        this.state.sortBy = event.target.id;

        this.setState(prevState => {
            let { displayResults, sortAsc } = prevState;

//           Константы для проверки первого элемента
            const firstElement = displayResults[0][event.target.id];
            const nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

            // Сортировка для количества просмотров
            if (firstElement[0] in nums && !firstElement.includes(':')) {
                displayResults = _.orderBy(displayResults, (obj) => parseInt(obj[event.target.id], 10), [sortAsc ? 'asc' : 'desc']);
            }

            // Сортировка для времени на сайте
            if (firstElement[0] in nums && firstElement.includes(':')) {
                displayResults = _.orderBy(displayResults, (obj) => parseInt(obj[event.target.id].replace(':', ''), 10), [sortAsc ? 'asc' : 'desc']);
            }

            // Сортировка для даты и времени визита
            if (firstElement.includes('GMT')) {
                displayResults = _.orderBy(displayResults, (obj) => Date.parse(obj[event.target.id]), [sortAsc ? 'asc' : 'desc'])
            }

            // Сортировка для всего остального
            if (!(firstElement[0] in nums) && !firstElement.includes('GMT')) {
                displayResults = _.orderBy(displayResults, event.target.id, [sortAsc ? 'asc' : 'desc'])
            }

            return {
                displayResults,
                sortAsc: sortAsc !== true
            };
        });
    };

    resizeColumn = (resizer) => {
        let x = 0;
        let w = 0;

        const mouseDownHandler = function(e) {
            // Get the current mouse position
            x = e.clientX;

            // Calculate the current width of column
            const styles = window.getComputedStyle(resizer.target.parentElement);
            w = parseInt(styles.width, 10);

            // Attach listeners for document's events
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function(e) {
            // Determine how far the mouse has been moved
            const dx = e.clientX - x;

            // Update the width of column
            resizer.target.parentElement.firstChild.style.width = `${w + dx}px`;
        };

        // When user releases the mouse, remove the existing event listeners
        const mouseUpHandler = function() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        resizer.target.addEventListener('mousedown', mouseDownHandler);
    }

    Column = () => {
        let tableColumns = []

        tableData.forEach(el=>{
            Object.keys(el).forEach((e)=>{
                tableColumns.push(e)
            })
        })

        tableColumns = tableColumns.filter((v, i, a) => a.indexOf(v) === i);

        return tableColumns.map((e)=>{
            return (
                <>
                    <th id={e} className="table-columns col-2">
                        <div className="table-headtext" >
                            <p id={e} onClick={this.sortResults} className="text-nowrap">{e}</p>
                            <p className="triangle">{this.state.sortBy===e? this.state.sortAsc === true ? ' ▼':' ▲' : ' ◀'}</p>
                        </div>
                        <TextField size='small' id={e} onChange={this.onChange} type="text" />
                        <span className="resizer" onMouseOver={this.resizeColumn} />
                    </th>
                </>
            )})
    }

    render() {
        return (
            <div>
                <div className="row">
                    <table id="resizeMe" className="table table-hover" style={{ width: "100%" }}>
                        <thead className="table-head border-top table-secondary">
                        <tr>
                            {this.Column()}
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.displayResults.map(item => (
                            <Row
                                columnKeys={item}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const Row = (columnKeys) => {
    return (
        <tr>
            {Object.values(columnKeys.columnKeys).map(el => {return <th className='table-light'>{el}</th>})}
        </tr>
    );
}

class App extends Component {
    render() {
        return (
            <div className="App">
                <TableMain />
            </div>
        );
    }
}

export default App
