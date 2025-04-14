import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import { FirestoreProvider } from "./context/FirestoreContext";
import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";


const students = [
  {
    id: 1,
    school: "초등학교",
    grade: "1학년",
    name: "이민호",
    phone: "010-1234-5678",
    english: true,
    math: false,
    schedule: [
      { day: "월", start: 14, end: 15 },
      { day: "화", start: 13, end: 14 },
      { day: "수", start: 15, end: 16 },
      { day: "목", start: null, end: null },
      { day: "금", start: 16, end: 17 },
      { day: "월_수학", start: null, end: null },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T1",attendance:"", in: 240510, out: 240202,in_math: null, out_math: null,
    math_T: null
  },
  {
    id: 2,
    school: "초등학교",
    grade: "2학년",
    name: "박지성",
    phone: "010-2345-6789",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: 13, end: 15 },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: null,attendance:"",in:null, out:null, in_math: 240110, out_math: null,
    math_T: "T3"
  },
  {
    id: 3,
    school: "초등학교",
    grade: "3학년",
    name: "김연아",
    phone: "010-3456-7890",
    english: true,
    math: true,
    schedule: [
      { day: "월", start: 14, end: 15 },
      { day: "화", start: 13, end: 14 },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: 15, end: 16 },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: 16, end: 18 },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T2",attendance:"",in: 240115, out: null, in_math:240315, out_math: 250211,
    math_T: "T3"
  },
  {
    id: 4,
    school: "초등학교",
    grade: "4학년",
    name: "손흥민",
    phone: "010-4567-8901",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 13, end: 15 },
      { day: "화_수학", start: 15, end: 16 },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: 16, end: 17 },
      { day: "금_수학", start: 14, end: 16 }
    ],
    eng_T: null,attendance:"",in: null, out:null, in_math: 240101, out_math: 250105,
    math_T: "T3"
  },
  {
    id: 5,
    school: "초등학교",
    grade: "5학년",
    name: "정우성",
    phone: "010-5678-9012",
    english: true,
    math: false,
    schedule: [
      { day: "월", start: 15, end: 16 },
      { day: "화", start: 14, end: 15 },
      { day: "수", start: 16, end: 17 },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: null, end: null },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T1",attendance:"",in: 240110, out: 250120,in_math: null, out_math:null,
    math_T: null
  },
  {
    id: 6,
    school: "초등학교",
    grade: "6학년",
    name: "한지민",
    phone: "010-6789-0123",
    english: true,
    math: true,
    schedule: [
      { day: "월", start: 14, end: 15 },
      { day: "화", start: 13, end: 14 },
      { day: "수", start: 15, end: 16 },
      { day: "목", start: 16, end: 17 },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: 15, end: 17 },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: "T2",attendance:"",in: 240125, out: 250202,in_math: 240615, out_math:null,
    math_T: "T3"
  },
  {
    id: 10,
    school: "초등학교",
    grade: "3학년",
    name: "박보검",
    phone: "010-1357-2468",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 14, end: 15 },
      { day: "화_수학", start: 15, end: 16 },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: null,attendance:"", in_math: 240130, out_math: 250218,in: null, out:null,
    math_T: "T4"
  },
  {
    id: 11,
    school: "초등학교",
    grade: "4학년",
    name: "송강호",
    phone: "010-9876-5432",
    english: true,
    math: false,
    schedule: [
      { day: "월", start: 14, end: 15 },
      { day: "화", start: null, end: null },
      { day: "수", start: 15, end: 16 },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: null, end: null },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T2",attendance:"", in: 240201, out: 250305,in_math: null, out_math:null,
    math_T: null
  },
  {
    id: 12,
    school: "중학교",
    grade: "1학년",
    name: "김희철",
    phone: "010-3698-1475",
    english: true,
    math: true,
    schedule: [
      { day: "월", start: 15, end: 16 },
      { day: "화", start: 14, end: 15 },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: 13, end: 14 },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: "T2",attendance:"", in: 240205, out: 250317,in_math: 250201, out_math:null,
    math_T: "T3"
  },
  {
    id: 13,
    school: "중학교",
    grade: "2학년",
    name: "정형돈",
    phone: "010-6543-9872",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: 13, end: 15 },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: null,attendance:"",in_math: 240210, out_math: 250404,in: null, out:null,
    math_T: "T3"
  },
  {
    id: 14,
    school: "중학교",
    grade: "3학년",
    name: "박나래",
    phone: "010-1122-3344",
    english: true,
    math: false,
    schedule: [
      { day: "월", start: 14, end: 15 },
      { day: "화", start: 13, end: 14 },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: 15, end: 16 },
      { day: "월_수학", start: null, end: null },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T2",attendance:"",in: 240215, out: 250429,in_math: null, out_math:null,
    math_T: null
  },
  {
    id: 15,
    school: "중학교",
    grade: "2학년",
    name: "이광수",
    phone: "010-9988-7766",
    english: true,
    math: true,
    schedule: [
      { day: "월", start: 13, end: 15 },
      { day: "화", start: 14, end: 16 },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: 15, end: 17 },
      { day: "월_수학", start: 14, end: 16 },
      { day: "화_수학", start: 15, end: 17 },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: 16, end: 18 }
    ],
    eng_T: "T1",attendance:"",in: 240315, out: null,in_math: 250301, out_math:null,
    math_T: "T3"
  },
  {
    id: 16,
    school: "고등학교",
    grade: "1학년",
    name: "유승호",
    phone: "010-2233-4455",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 13, end: 15 },
      { day: "화_수학", start: 14, end: 16 },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: 16, end: 18 },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: null,attendance:"",in_math: 240310, out_math: null,in: null, out:null,
    math_T: "T3"
  },
  {
    id: 17,
    school: "고등학교",
    grade: "2학년",
    name: "김유정",
    phone: "010-3344-5566",
    english: true,
    math: false,
    schedule: [
      { day: "월", start: 13, end: 14 },
      { day: "화", start: 14, end: 15 },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: 15, end: 16 },
      { day: "월_수학", start: null, end: null },
      { day: "화_수학", start: null, end: null },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: null, end: null },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T2",attendance:"", in: 240305, out: null ,in_math: null, out_math:null,
    math_T: null
  },
  {
    id: 18,
    school: "고등학교",
    grade: "3학년",
    name: "박보영",
    phone: "010-5566-7788",
    english: true,
    math: true,
    schedule: [
      { day: "월", start: 14, end: 16 },
      { day: "화", start: null, end: null },
      { day: "수", start: 15, end: 17 },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 16, end: 18 },
      { day: "화_수학", start: 14, end: 16 },
      { day: "수_수학", start: null, end: null },
      { day: "목_수학", start: 15, end: 17 },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: "T1",attendance:"", in: 240301, out: null,in_math: 240102, out:null,
    math_T: "T4"
  },
  {
    id: 19,
    school: "고등학교",
    grade: "1학년",
    name: "김혜수",
    phone: "010-6677-8899",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 13, end: 15 },
      { day: "화_수학", start: 14, end: 16 },
      { day: "수_수학", start: 15, end: 17 },
      { day: "목_수학", start: 16, end: 18 },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: null,attendance:"", in_math: 240215, out_math: null,in: null, out:null,
    math_T: "T3"
  },
  {
    id: 99,
    school: "고등학교",
    grade: "9학년",
    name: "예시다",
    phone: "010-6677-8899",
    english: false,
    math: true,
    schedule: [
      { day: "월", start: null, end: null },
      { day: "화", start: null, end: null },
      { day: "수", start: null, end: null },
      { day: "목", start: null, end: null },
      { day: "금", start: null, end: null },
      { day: "월_수학", start: 12, end: 13 },
      { day: "화_수학", start: 13, end: 15 },
      { day: "수_수학", start: 13, end: 14 },
      { day: "목_수학", start: 16, end: 17 },
      { day: "금_수학", start: null, end: null }
    ],
    eng_T: null,attendance:"", in_math: 240210, out_math: null, in: null, out:null,
    math_T: "T3"
  }
];


const uploadStudentsToFirestore = async () => {
  try {
    const studentsCollection = collection(db, "students-info");
    const querySnapshot = await getDocs(studentsCollection);

    const docsMap = {};
    querySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      docsMap[data.id] = docSnap.id; // 실제 Firestore 문서 ID를 저장
    });

    for (const student of students) {
      const firestoreId = docsMap[student.id];
      if (firestoreId) {
        // 🔥 기존 문서 업데이트: 필드만 추가 또는 수정
        await updateDoc(doc(db, "students-info", firestoreId), {
          in: student.in || null,
          out: student.out || null,
          in_math: student.in_math || null,
          out_math: student.out_math || null,
        });
        
        console.log(`🛠️ ${student.name} 필드 업데이트 완료`);
      } else {
        // 존재하지 않는 경우 새로 추가
        await addDoc(studentsCollection, student);
        console.log(`✅ ${student.name} 새로 추가 완료`);
      }
    }

    console.log("🎉 모든 데이터 처리 완료");
  } catch (error) {
    console.error("❌ Firestore 업데이트 오류:", error);
  }
};

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        uploadStudentsToFirestore(); // 로그인된 경우에만 업로드 시도
      }
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) return <div>로딩 중...</div>;

  return (
    <FirestoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </Router>
    </FirestoreProvider>
  );
}

export default App;