import React, { createContext, useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Context 생성
export const FirestoreContext = createContext();

// Provider 컴포넌트 정의
export const FirestoreProvider = ({ children }) => {
  const [students, setStudents] = useState([]); // 학생 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태

  // Firestore에서 학생 정보를 가져오는 함수
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("Firestore에서 학생 데이터 불러오는 중...");
        const studentsCollection = collection(db, "students-info");
        const querySnapshot = await getDocs(studentsCollection);

        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore 문서 ID 사용
            ...doc.data(),
          }));

          setStudents(studentData);
          console.log("✅ Firestore에서 학생 데이터 불러오기 완료:", studentData);
        } else {
          console.warn("⚠️ Firestore에 학생 데이터가 없습니다.");
        }
      } catch (error) {
        console.error("❌ Firestore에서 학생 데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false); // Firestore 응답이 끝나면 로딩 상태 해제
      }
    };

    fetchStudents();
  }, []);

  return (
    <FirestoreContext.Provider value={{ students, loading }}>
      {children}
    </FirestoreContext.Provider>
  );
};