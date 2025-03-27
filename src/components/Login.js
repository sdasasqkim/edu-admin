import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; 
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 비밀번호 표시/숨김 아이콘

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false); // 회원가입 화면 표시 여부
  const [signupData, setSignupData] = useState({
    email: "",
    english: false,
    math: false,
    id: "",
    password: "",
    phone_num: "",
  });
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 가시성 토글
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminCollection = collection(db, "admin");
      const q = query(adminCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        if (userData.password !== password) {
          alert("❌ 비밀번호가 일치하지 않습니다.");
          return;
        }

        if (userData.chk_for_admin !== true) {
          alert("⚠️ 해당 계정은 관리자 권한이 없습니다.");
          return;
        }

        localStorage.setItem("username", id);
        alert("✅ 로그인 성공! 메인 페이지로 이동합니다.");
        navigate("/Home");
      } else {
        alert("❌ 해당 ID가 존재하지 않습니다.");
      }
    } catch (error) {
      console.error("❌ 로그인 중 오류 발생:", error);
      alert("⚠️ 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newUser = {
        email: signupData.email,
        english: signupData.english,
        math: signupData.math,
        id: signupData.id,
        password: signupData.password,
        phone_num: signupData.phone_num,
        chk_for_admin: false, // 기본 권한 fale
      };

      await addDoc(collection(db, "admin"), newUser);
      setSignupSuccess(true); // 회원가입 완료 메시지 표시
      setTimeout(() => {
        setSignupSuccess(false);
        setShowSignup(false); // 회원가입 화면 닫기
      }, 1000);
    } catch (error) {
      console.error("❌ 회원가입 중 오류 발생:", error);
      alert("⚠️ 회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="justify-content-center transition-container" style={{ width: showSignup ? "800px" : "400px", transition: "width 0.3s ease-in-out" }}>
        {/* 로그인 컨테이너 */}
        <Col md={showSignup ? 6 : 12} className="transition-item">
          <Card className="p-4 shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">Login</h3>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="id">
                  <Form.Label>ID</Form.Label>
                  <Form.Control type="text" placeholder="ID 입력" value={id} onChange={(e) => setId(e.target.value)} required />
                </Form.Group>

                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 mt-3" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
              </Form>
              <Button variant="link" className="mt-3 w-100" onClick={() => setShowSignup(true)}>
                회원가입
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* 회원가입 컨테이너 */}
        {showSignup && (
          <Col md={6} className="transition-item">
            <Card className="p-4 shadow-lg">
              <Card.Body>
                <h3 className="text-center mb-4">Sign Up</h3>
                <Form onSubmit={handleSignup}>
                  <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="이메일 입력" name="email" value={signupData.email} onChange={handleSignupChange} required />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>과목 선택</Form.Label>
                    <Form.Check label="영어" name="english" checked={signupData.english} onChange={handleSignupChange} />
                    <Form.Check label="수학" name="math" checked={signupData.math} onChange={handleSignupChange} />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>ID</Form.Label>
                    <Form.Control type="text" name="id" placeholder="ID 입력" value={signupData.id} onChange={handleSignupChange} required />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>비밀번호</Form.Label>
                    <InputGroup>
                      <Form.Control type={showPassword ? "text" : "password"} name="password" placeholder="비밀번호 입력" value={signupData.password} onChange={handleSignupChange} required />
                      <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>전화번호</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="phone_num" 
                      placeholder="000-0000-0000" 
                      value={signupData.phone_num} 
                      onChange={handleSignupChange} 
                      required 
                    />
                  </Form.Group>


                  <Button variant="primary" type="submit" className="w-100 mt-3">
                    회원가입
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>

  );
}

export default Login;