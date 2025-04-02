# import tools to add data to database
from sqlalchemy.orm import Session
from faker import Faker
import random
from app.database import engine
from app.models import users, posts, postImages, postComments, favourites
from fastapi import FastAPI

# import tools to crawl web data
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

app = FastAPI()

fake = Faker("vi_VN")
fake_username = Faker()

genders = ["Male", "Female", "Other"]
room_nums = [1,2,3,4]

# Create a session
session = Session(bind=engine)

user_list = []
post_list = []
image_list = []

# for i in range(70):
#     user = users.Users(
#         username=fake_username.user_name(),
#         email=fake_username.email(),
#         password=fake.password(length=10),
#         avatar_url=f"https://i.pravatar.cc/150?img={i}",
#         contact_number=fake.phone_number(),
#         address=fake.address(),
#         gender=random.choice(genders),
#         birthday=fake.date_of_birth(minimum_age=18, maximum_age=50)
#     )
#     user_list.append(user)

# session.add_all(user_list)
# session.commit()

driver = webdriver.Chrome()
driver.implicitly_wait(30)

i = 2
post_count = 20 * (i-2) + 1

link_base = f"https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-mini/p{i}?cIds=57"

driver.get(link_base)

try:
    card_elements = WebDriverWait(driver, 10).until(
    EC.presence_of_all_elements_located((By.CLASS_NAME, "js__card"))
)
    for element in card_elements:
        title_element = element.find_element(By.CLASS_NAME, "re__card-info")
        price_element = element.find_element(By.CLASS_NAME, "re__card-config-price")
        img_element = element.find_element(By.CLASS_NAME, "re__card-image")
        area_element = element.find_element(By.CLASS_NAME, "re__card-config-area")
        description_element = element.find_element(By.CLASS_NAME, "re__card-description")
        address_element = element.find_element(By.CLASS_NAME, "re__card-location")
        imgs = img_element.find_elements(By.TAG_NAME, "img")
    
        post = posts.Posts(
        user_id = random.randint(1,400),
        title = title_element.get_attribute("title"),
        description = description_element.text,
        price = price_element.text,
        address = address_element.text,
        room_num = random.choice(room_nums)
        )
    
        post_list.append(post)

        for img in imgs:
            post_img = postImages.PostImages(
                post_id = post_count,
                image_url = (img.get_attribute("src") or img.get_attribute("data-src"))
            )
            image_list.append(post_img)
    
        post_count += 1
except Exception as e:
    print(e)
driver.quit()

session.add_all(post_list)
session.commit()
session.add_all(image_list)
session.commit()

i += 1