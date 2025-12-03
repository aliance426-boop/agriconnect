#include<iostream>
#include<memory.h>
class Entity{
    const int m_x,m_y;

    ~Entity(){
        std::cout << "I am destroyed" << std::endl;
    }
};

int main(){
    {
        std::unique_ptr<Entity> age = int(new Entity);
    }
}