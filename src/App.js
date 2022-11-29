import React from "react";
import './App.css';
import axios from "axios";
import {Button, Table} from "react-bootstrap";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { CSVLink } from "react-csv";
import {ExportCSV} from "./ExportCSV";

const timezones = [-1, 0, 1, 2, 3, 4, 5, 6, 7];

function App() {
  const [users, setUsers] = React.useState([]);
  const [openApp, setOpenApp] = React.useState(null);
  const [uniqueUsers, setUniqueUsers] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [winners, setWinners] = React.useState([]);
  const [exelUsers, setExelUsers] = React.useState([]);

  const [sortUsers, setSortUsers] = React.useState([]);

  const [count, setCount] = React.useState({
      timezone: 0,
      timeAnswer: 0,
      numberLive: 0,
      numberAns: 0,
      correct: 0,
      isWin: 0,
  });

  const [winnersSetting, setWinnersSetting] = React.useState({
      fio: 0,
      numberAns: 0,
      numberLive: 0,
      timezone: 0,
      timeAnswer: 0,
  });

  const [sortWinners, setSortWinners] = React.useState([]);

  const [isShowOpenApp, setIsShowOpenApp] = React.useState(false);
  const [isShowUniqueUsers, setIsShowUniqueUsers] = React.useState(false);
  const [isShowCountQuestionsAnswer, setIsShowCountQuestionsAnswer] = React.useState(false);
  const [isShowUsers, setIsShowUsers] = React.useState(false);
  const [isShowWinners, setIsShowWinners] = React.useState(false);

  const winnerRef = React.useRef(null);
  const usersRef = React.useRef(null);

  React.useEffect(() => {
    (async () => {
      const { data } = await axios.get('https://95-163-237-191.cloudvps.regruhosting.ru/api/stats');
      setOpenApp(data);
    })();
    (async () => {
      const { data } = await axios.get('https://95-163-237-191.cloudvps.regruhosting.ru/api/user');
      setUniqueUsers(data);
    })();
    (async () => {
      const { data } = await axios.get('https://95-163-237-191.cloudvps.regruhosting.ru/api/quest/all');
      setQuestions(data);
      console.log(data)

      const array = [];

        data.map(item => item.answers.map(user => array.push({
            id: user.id,
            timezone: user.timezone,
            timeAnswer: user.timeAnswer,
            numberLive: user.numberLive,
            numberAns: item.number,
            correct: +user.correct,
            isWin: +item.answers
                .sort((a, b) => a.timeAnswer.localeCompare(b.timeAnswer))
                .filter(obj => obj.correct === true && obj.isLate === false)
                .slice(0, 3)
                .includes(item.answers.find(el => el.id === user.id))
        })
    ))

      const winners = [];

        data.map(item => item.answers.sort((a, b) => a.timeAnswer.localeCompare(b.timeAnswer))
            .filter(obj => obj.correct === true && obj.isLate === false)
            .slice(0, 3).map(user => winners.push({
                id: user.id,
                fio: user.firstName + ' ' + user.lastName,
                numberAns: item.number,
                numberLive: user.numberLive,
                timezone: user.timezone,
                timeAnswer: user.timeAnswer,
            })))

      setSortUsers(array);
      setSortWinners(winners);

      const currWinners = [];
      const currUsers = [];

      data.map(item => item.answers.sort((a, b) => a.timeAnswer.localeCompare(b.timeAnswer))
          .filter(obj => obj.correct === true  && obj.isLate === false)
          .slice(0, 3).map(user => currWinners.push({
            id: ' ' + user.id,
            "Фамилия и Имя": user.firstName + ' ' + user.lastName,
            "Номер вопроса": item.number,
            "Часовой пояс": user.timezone,
            "Время ответа": user.timeAnswer
          })));
      setWinners(currWinners);

      data.map(item => item.answers.map(user =>
          currUsers.push({
            id: ' ' + user.id,
            "Часовой пояс": user.timezone,
            "Дата и время ответа": user.timeAnswer,
            "Номер выпуска": user.numberLive,
              "Номер вопроса": item.number,
              "Правильно ли ответил": +user.correct,
            "Попал ли в список победителей": +item.answers
                .sort((a, b) => a.timeAnswer.localeCompare(b.timeAnswer))
                .filter(obj => obj.correct === true  && obj.isLate === false)
                .slice(0, 3)
                .includes(item.answers.find(el => el.id === user.id))
          })))
      setExelUsers(currUsers);
    })();

  }, []);

    const sort = (prams) => {
        const array = sortUsers.sort(function(a, b) {
            if(prams === "timeAnswer") {
                return count[prams] ? a.timeAnswer.localeCompare(b.timeAnswer) : b.timeAnswer.localeCompare(a.timeAnswer)
            } else
            return count[prams] ? a[prams] - b[prams] : b[prams] - a[prams];
        });

        setSortUsers(array);
        let newCount = { ...count };
        newCount[prams] = !newCount[prams];
        setCount(newCount);

        const currUsers = [];

        array.map(user =>
            currUsers.push({
                id: ' ' + user.id,
                "Часовой пояс": user.timezone,
                "Дата и время ответа": user.timeAnswer,
                "Номер выпуска": user.numberLive,
                "Номер вопроса": user.numberAns,
                "Правильно ли ответил": user.correct,
                "Попал ли в список победителей": user.isWin
            }))
        setExelUsers(currUsers);

    };

    const sortW = (prams) => {
        const array = sortWinners.sort(function(a, b) {
            if (prams === "fio") {
                if(winnersSetting[prams]) {
                    if (a[prams] > b[prams]) return 1;
                    else if (a[prams] < b[prams]) return -1;
                    else return 0;
                } else {
                    if (b[prams] > a[prams]) return 1;
                    else if (b[prams] < a[prams]) return -1;
                    else return 0;
                }
            }
            else if(prams === "timeAnswer") {
                return winnersSetting[prams] ? a.timeAnswer.localeCompare(b.timeAnswer) : b.timeAnswer.localeCompare(a.timeAnswer)
            } else
            return winnersSetting[prams] ? a[prams] - b[prams] : b[prams] - a[prams];
        });

        setSortWinners(array);
        let setting = { ...winnersSetting };
        setting[prams] = !setting[prams];
        setWinnersSetting(setting);

        const currWinners = [];

        array.map(user => currWinners.push({
            id: ' ' + user.id,
            "Фамилия и Имя": user.fio,
            "Номер вопроса": user.numberAns,
            "Номер выпуска": user.numberLive,
            "Часовой пояс": user.timezone,
            "Время ответа": user.timeAnswer
        }));
        setWinners(currWinners);

    };

  return (
    <div className="App">
      <h4 onClick={() => setIsShowOpenApp(!isShowOpenApp)}>Количество открытий приложения по каждому из участвующих часовых поясов</h4>
      {isShowOpenApp && <Table striped bordered hover>
        <thead>
        <tr>
          <th>Часовой пояс</th>
          <th>Количество</th>
        </tr>
        </thead>
        <tbody>
        {timezones.map(item =>
            <tr key={item}>
              <td>{item}</td>
              {openApp && <td>{openApp.find(el => el.timezone === item)?.openApp}</td>}
            </tr>)}
        </tbody>
      </Table>}
      <h4 onClick={() => setIsShowUniqueUsers(!isShowUniqueUsers)}>Количество уникальных пользователей по каждому из участвующих часовых поясов</h4>
      {isShowUniqueUsers && <Table striped bordered hover>
        <thead>
        <tr>
          <th>Часовой пояс</th>
          <th>Количество</th>
        </tr>
        </thead>
        <tbody>
        {timezones.map(item =>
            <tr key={item}>
              <td>{item}</td>
              {uniqueUsers && <td>{uniqueUsers.filter(x => x.timezone == item).length}</td>}
            </tr>)}
        </tbody>
      </Table>}
      <h4 onClick={() => setIsShowCountQuestionsAnswer(!isShowCountQuestionsAnswer)}>Количество ответов на каждый вопрос по каждому из участвующих часовых поясов</h4>
      {isShowCountQuestionsAnswer && <Table striped bordered hover>
        <thead>
        <tr>
          <th>Номер вопроса</th>
          <th>Часовой пояс</th>
          <th>Количество</th>
        </tr>
        </thead>
        <tbody>
        {questions.map(item =>
            <tr key={item._id}>
              <td>{item.number}</td>
              <td>{item.timezone}</td>
              <td>{item.answers.length}</td>
            </tr>)}
        </tbody>
      </Table>}
       <h4 onClick={() => setIsShowUsers(!isShowUsers)}>Список пользователей</h4>
      {isShowUsers && <div>
        <ExportCSV csvData={exelUsers} fileName={'users'} />
        <Table striped bordered hover ref={usersRef}>
          <thead>
          <tr>
            <th>id</th>
            <th onClick={() => sort('timezone')}>Часовой пояс</th>
            <th onClick={() => sort('timeAnswer')}>Дата и время ответа</th>
            <th onClick={() => sort('numberLive')}>Номер выпуска</th>
            <th onClick={() => sort('numberAns')}>Номер вопроса</th>
            <th onClick={() => sort('correct')}>Правильно ли ответил</th>
            <th onClick={() => sort('isWin')}>Попал ли в список победителей</th>
          </tr>
          </thead>
          <tbody>
          {sortUsers.map((item, index) => <TableUserItem key={index} user={item}/>)}
          </tbody>
        </Table>
      </div>}
      <h4 onClick={() => setIsShowWinners(!isShowWinners)}>Список победителей</h4>
      {isShowWinners && <div>
        <ExportCSV csvData={winners} fileName={'winners'} />
        <Table striped bordered hover ref={winnerRef}>
          <thead>
          <tr>
            <th>id</th>
            <th onClick={() => sortW('fio')}>Фамилия и Имя</th>
            <th onClick={() => sortW('numberAns')}>Номер вопроса</th>
            <th onClick={() => sortW('numberLive')}>Номер выпуска</th>
            <th onClick={() => sortW('timezone')}>Часовой пояс</th>
            <th onClick={() => sortW('timeAnswer')}>Время ответа</th>
          </tr>
          </thead>
          <tbody>
          {sortWinners.map((item, index) => <TableWinnerItem key={index} user={item}/>)}
          </tbody>
        </Table>
      </div>}
    </div>
  );
}

const TableUserItem = ({ user }) => {
    return(
    <tr>
        <td>{user.id}</td>
        <td>{user.timezone}</td>
        <td>{user.timeAnswer}</td>
        <td>{user.numberLive}</td>
        <td>{user.numberAns}</td>
        <td>{user.correct}</td>
        <td>{user.isWin}</td>
    </tr>
    )
};
const TableWinnerItem = ({ user }) => {
    return(
    <tr>
        <td>{user.id}</td>
        <td>{user.fio}</td>
        <td>{user.numberAns}</td>
        <td>{user.numberLive}</td>
        <td>{user.timezone}</td>
        <td>{user.timeAnswer}</td>
    </tr>
    )
};

export default App;
