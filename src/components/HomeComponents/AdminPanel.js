import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Table, Button } from "react-bootstrap";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "admin"));
  
      const usersData = querySnapshot.docs.map((doc) => ({
        firestoreId: doc.id, // Firestore 문서 ID (랜덤)
        ...doc.data(),       // 기존 필드(id, email 등) 유지
      }));
  
      console.log("Firestore에서 불러온 사용자 데이터:", usersData);
      setUsers(usersData);
    };
  
    fetchUsers();
  }, []);
  
  
  
  const toggleAdminStatus = async (firestoreId, currentStatus) => {
    setLoading(true);
    try {
      console.log(`🔄 업데이트 요청: 문서 ID=${firestoreId}, 현재 상태=${currentStatus}`);
  
      const userRef = doc(db, "admin", firestoreId); // Firestore 문서 ID 사용
      console.log("Firestore 문서 참조:", userRef.path);
  
      await updateDoc(userRef, { chk_for_admin: !currentStatus });
  
      console.log(`✅ 업데이트 성공: 문서 ID=${firestoreId}, 새 상태=${!currentStatus}`);
  
      // 🔹 UI 상태 업데이트
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.firestoreId === firestoreId ? { ...user, chk_for_admin: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("❌ Firestore 업데이트 실패:", error);
      alert(`⚠️ Firestore 업데이트 오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
   

  return (
    <div>
      <h3>🔑 관리자 권한 관리</h3>
      <Table bordered>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>전화번호</th>
            <th>영어</th>
            <th>수학</th>
            <th>관리자 권한</th>
            <th>설정</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.phone_num}</td>
              <td>{user.english ? "✅": "❌"}</td>
              <td>{user.math ? "✅": "❌"}</td>
              <td>{user.chk_for_admin ? "✅ 활성화" : "❌ 비활성화"}</td>
              <td>
                <Button
                    variant={user.chk_for_admin ? "danger" : "success"}
                    onClick={() => toggleAdminStatus(user.firestoreId, user.chk_for_admin)}
                    disabled={loading}
                >
                    {loading ? "처리 중..." : user.chk_for_admin ? "권한 박탈" : "권한 부여"}
                </Button>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminPanel;