SET time_zone = '+09:00';
CREATE TABLE IF NOT EXISTS _welcome (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message VARCHAR(255) NOT NULL
);
INSERT INTO _welcome (message) VALUES ('phpMyAdmin ログイン成功！');
