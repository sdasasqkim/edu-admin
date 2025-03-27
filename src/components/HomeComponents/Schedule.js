import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./Schedule.css";

function Schedule() {
  const [students, setStudents] = useState([]);
  const [popup, setPopup] = useState({ visible: false, data: null, position: { x: 0, y: 0 }, context: null });

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students-info"));
      const studentData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    };
    fetchStudents();
  }, []);

  const days = ["월", "화", "수", "목", "금"];
  const hours = [13, 14, 15, 16, 17, 18, 19];

  const getCounts = (day, hour) => {
    let englishCount = 0;
    let mathCount = 0;
    students.forEach((student) => {
      student.schedule.forEach((s) => {
        if (s.day === day && s.start <= hour && s.end > hour) englishCount++;
        if (s.day === `${day}_수학` && s.start <= hour && s.end > hour) mathCount++;
      });
    });
    return { english: englishCount, math: mathCount, total: englishCount + mathCount };
  };

  const getDetailsAt = (day, hour) => {
    const english = [];
    const math = [];
    students.forEach((student) => {
      student.schedule.forEach((s) => {
        if (s.day === day && s.start <= hour && s.end > hour) {
          english.push(`${student.grade} ${student.name}`);
        }
        if (s.day === `${day}_수학` && s.start <= hour && s.end > hour) {
          math.push(`${student.grade} ${student.name}`);
        }
      });
    });
    return { english, math };
  };

  const handleCellClick = (day, hour, subject, e) => {
    const data = getDetailsAt(day, hour);
    setPopup({ visible: true, data, position: { x: e.clientX, y: e.clientY }, context: { day, hour, subject } });
  };

  const closePopup = () => setPopup({ visible: false, data: null, position: { x: 0, y: 0 }, context: null });

  return (
    <div className="schedule-page">
      <h3>📅 시간표</h3>
      <table className="schedule-table">
        <thead>
          <tr>
            <th rowSpan="2" className="time-col">시간</th>
            {days.map((day) => (
              <th key={day} colSpan="3">{day}</th>
            ))}
          </tr>
          <tr className="schedule-subjects">
            {days.flatMap((day) => [
              <th key={`${day}-eng`}>영어</th>,
              <th key={`${day}-math`}>수학</th>,
              <th key={`${day}-total`} className="total-header total-cell">전체</th>
            ])}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="time-col">{`${hour}:00`}</td>
              {days.map((day) => {
                const counts = getCounts(day, hour);
                return [
                  <td key={`${day}-${hour}-eng`} className="schedule-cell" onClick={(e) => handleCellClick(day, hour, "영어", e)}>{counts.english || ''}</td>,
                  <td key={`${day}-${hour}-math`} className="schedule-cell" onClick={(e) => handleCellClick(day, hour, "수학", e)}>{counts.math || ''}</td>,
                  <td key={`${day}-${hour}-total`} className="schedule-cell total-cell" onClick={(e) => handleCellClick(day, hour, "전체", e)}>{counts.total || ''}</td>
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {popup.visible && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <strong>{popup.context.subject}</strong> - {popup.context.day}요일 - {popup.context.hour}:00
            </div>
            <div className="popup-grid">
              {(popup.context.subject === "영어" || popup.context.subject === "전체") && (
                <div>
                  <h5>영어</h5>
                  <ul>
                    {popup.data.english.map((name, i) => (
                      <li key={`eng-${i}`}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(popup.context.subject === "수학" || popup.context.subject === "전체") && (
                <div>
                  <h5>수학</h5>
                  <ul>
                    {popup.data.math.map((name, i) => (
                      <li key={`math-${i}`}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;