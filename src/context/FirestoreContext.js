import React, { createContext, useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export const FirestoreContext = createContext();

export const FirestoreProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      console.log("Firestore에서 학생 데이터 불러오는 중...");
      const studentsCollection = collection(db, "students-info");
      const querySnapshot = await getDocs(studentsCollection);

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs.map((doc) => ({
          firestoreId: doc.id,        // 🔥 Firestore 문서 ID 저장
          ...doc.data(),              // 여기에 실제 학생 id: 99 등이 들어감
        }));
        
        setStudents(studentData);
        console.log("✅ Firestore에서 학생 데이터 불러오기 완료:", studentData);
      } else {
        console.warn("⚠️ Firestore에 학생 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("❌ Firestore에서 학생 데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchStudents(); // 로그인 한 경우에만 실행
      } else {
        setLoading(false); // 로그인 안 한 상태에서도 로딩 멈추기
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirestoreContext.Provider value={{ students, loading }}>
      {children}
    </FirestoreContext.Provider>
  );
};
