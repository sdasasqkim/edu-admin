import React, { useEffect, useState } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

function AdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminOnly, setAdminOnly] = useState(false);
  const [nonAdminOnly, setNonAdminOnly] = useState(false);

  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, "admin"));
      const data = snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...docSnap.data(),
      }));
      setAdmins(data);
    } catch (error) {
      console.error("❌ 관리자 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const toggleAdmin = async (uid, currentValue) => {
    try {
      const ref = doc(db, "admin", uid);
      await updateDoc(ref, { chk_for_admin: !currentValue });
      fetchAdmins();
    } catch (error) {
      console.error("❌ 관리자 권한 변경 실패:", error);
      alert("⚠️ 관리자 권한을 변경할 수 없습니다.");
    }
  };

  const toggleLogin = async (uid, currentValue) => {
    try {
      const ref = doc(db, "admin", uid);
      await updateDoc(ref, { allow_login: !currentValue });
      fetchAdmins();
    } catch (error) {
      console.error("❌ 로그인 권한 변경 실패:", error);
      alert("⚠️ 로그인 권한을 변경할 수 없습니다.");
    }
  };

  const filteredAdmins = admins
    .filter((admin) => admin.id !== localStorage.getItem("username"))
    .filter((admin) => {
      const search = searchTerm.toLowerCase();
      const match = admin.email.toLowerCase().includes(search) || admin.id.toLowerCase().includes(search);
      if (adminOnly) return match && admin.chk_for_admin;
      if (nonAdminOnly) return match && !admin.chk_for_admin;
      return match;
    });

  return (
    <div className="p-4">
      <h4>🔐 관리자 권한 관리</h4>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="이메일 또는 ID 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6} className="d-flex gap-3 align-items-center">
          <Form.Check
            type="checkbox"
            label="관리자만 보기"
            checked={adminOnly}
            onChange={() => {
              setAdminOnly(!adminOnly);
              if (!adminOnly) setNonAdminOnly(false);
            }}
          />
          <Form.Check
            type="checkbox"
            label="일반 사용자만 보기"
            checked={nonAdminOnly}
            onChange={() => {
              setNonAdminOnly(!nonAdminOnly);
              if (!nonAdminOnly) setAdminOnly(false);
            }}
          />
        </Col>
      </Row>

      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Email</th>
            <th>ID</th>
            <th>영어</th>
            <th>수학</th>
            <th>전화번호</th>
            <th>최근 로그인</th>
            <th>관리자 권한</th>
            <th>로그인 허용</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map((admin) => (
            <tr key={admin.uid}>
              <td>{admin.email}</td>
              <td>{admin.id}</td>
              <td>{admin.english ? "✔" : "✘"}</td>
              <td>{admin.math ? "✔" : "✘"}</td>
              <td>{admin.phone_num}</td>
              <td>{admin.last_login ? new Date(admin.last_login.seconds * 1000).toLocaleString("ko-KR") : "-"}</td>
              <td>
                <Button
                  variant={admin.chk_for_admin ? "danger" : "secondary"}
                  size="sm"
                  onClick={() => toggleAdmin(admin.uid, admin.chk_for_admin)}
                >
                  {admin.chk_for_admin ? "권한 제거" : "권한 부여"}
                </Button>
              </td>
              <td>
                <Button
                  variant={admin.allow_login ? "warning" : "primary"}
                  size="sm"
                  onClick={() => toggleLogin(admin.uid, admin.allow_login)}
                >
                  {admin.allow_login ? "로그인 차단" : "로그인 허용"}
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