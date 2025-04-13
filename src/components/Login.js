import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    email: "",
    english: false,
    math: false,
    id: "",
    password: "",
    phone_num: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(db, "admin", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("❌ 사용자 정보가 존재하지 않습니다.");
        return;
      }

      const userData = docSnap.data();
      if (!userData.allow_login) {
        alert("🚫 현재 이 계정은 로그인 권한이 없습니다. 관리자에게 문의하세요.");
        return;
      }

      // 최근 로그인 시간 업데이트
      await updateDoc(docRef, { last_login: new Date() });

      localStorage.setItem("username", userData.id);
      localStorage.setItem("isAdmin", userData.chk_for_admin ? "true" : "false");
      localStorage.setItem("uid", uid);

      if (userData.chk_for_admin) {
        alert("✅ 관리자님, 환영합니다!");
      } else {
        alert("✅ 관리자 권한 없이 로그인합니다.");
      }

      navigate("/Home");
    } catch (error) {
      console.error("❌ 로그인 오류:", error);
      alert("❌ 로그인에 실패했습니다.");
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
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const uid = userCredential.user.uid;

      const newUser = {
        email: signupData.email,
        english: signupData.english,
        math: signupData.math,
        id: signupData.id,
        password: signupData.password,
        phone_num: signupData.phone_num,
        chk_for_admin: false,
        allow_login: false,
        last_login: null,
      };

      await setDoc(doc(db, "admin", uid), newUser);

      setSignupSuccess(true);
      setTimeout(() => {
        setSignupSuccess(false);
        setShowSignup(false);
      }, 1000);
    } catch (error) {
      console.error("❌ 회원가입 오류:", error);
      alert("❌ 회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row
        className="justify-content-center transition-container"
        style={{ width: showSignup ? "800px" : "400px", transition: "width 0.3s ease-in-out" }}
      >
        <Col md={showSignup ? 6 : 12} className="transition-item">
          <Card className="p-4 shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">Login</h3>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="이메일 입력"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

        {showSignup && (
          <Col md={6} className="transition-item">
            <Card className="p-4 shadow-lg">
              <Card.Body>
                <h3 className="text-center mb-4">Sign Up</h3>
                <Form onSubmit={handleSignup}>
                  <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="이메일 입력"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>과목 선택</Form.Label>
                    <Form.Check label="영어" name="english" checked={signupData.english} onChange={handleSignupChange} />
                    <Form.Check label="수학" name="math" checked={signupData.math} onChange={handleSignupChange} />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="id"
                      placeholder="ID 입력"
                      value={signupData.id}
                      onChange={handleSignupChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>비밀번호</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="비밀번호 입력"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        required
                      />
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
