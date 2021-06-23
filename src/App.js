import React, { Component } from 'react'
import './App.css'
import {tableData} from "./faker";
import _  from "lodash";

// Колонки таблицы
const tableColumns = {
    visitDate: 'Дата и время визита',
    activityLevel: 'Активность',
    activityTime: 'Время на сайте',
    visitCount: 'Просмотры',
    searchPhrase: 'Фраза',
    gender: 'Пол',
    address: 'Почтовый индекс',
    country: 'Страна'
}

// Генерация таблицы
class TableMain extends Component {
    state = {
        originalResults: [],
        displayResults: [],
        sortBy: null,
        sortAsc: true,
        filterBy: [],
        filterTypes: [],
        filterProps: []
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

    render() {
        return (
            <div>
                <div className="row">
                    <table className="table table-hover" style={{ width: "100%" }}>
                        <thead className="table-head border-top table-secondary">
                        <tr>
                            {Object.entries(tableColumns).map((e) => {
                                return (
                                    <th id={e[0]} className="table-columns col-2">
                                        <div className="table-headtext">
                                            <p id={e[0]} onClick={this.sortResults} className="text-nowrap">{e[1]}</p>
                                            <p className="triangle">{this.state.sortBy===e[0]? this.state.sortAsc === true ? ' 🢗':' 🢕' : ' 🢔'}</p>
                                        </div>
                                        <input  id={e[0]} label="Search" onChange={this.onChange} type="text" className="form-control" />
                                        <span className="vl"/>
                                    </th>
                                )
                            })}
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
