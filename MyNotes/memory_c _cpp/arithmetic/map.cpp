#include <iostream>
#define N 10
#define MAX 1000000000
using namespace std;

// 48

typedef struct queue{
    int data;
    struct queue* next;
} queue;

void enqueue(queue** head, int data){//入队，在后
    queue* new_node = (queue*)malloc(sizeof(queue));
    new_node->data = data;
    new_node->next = NULL;
    if(*head == NULL){
        *head = new_node;
    }else{
        queue* temp = *head;
        while(temp->next!= NULL){
            temp = temp->next;
        }
        temp->next = new_node;
    }
}

bool is_empty_queue(queue* head){
    return head == NULL;
}

int read_queue(queue* head){
    if(is_empty_queue(head)){
        return -1;
    }
    return head->data;
}

void dequeue(queue** head){
    if(is_empty_queue(*head)){
        return;
    }
    queue* temp = *head;
    *head = (*head)->next;
    delete temp;
}

void print_queue(queue* head){
    queue* temp = head;
    while(temp!= NULL){
        cout << temp->data << " ";
        temp = temp->next;
    }
}

typedef struct {
    int side[N][N] = {0};
    char drop[N][N] = {0};
} map;

//border first search
int* breadthFirstSearch(map* t, int start, int end){
    int distant[N];
    for(int i = 0; i < N; i++) {
        distant[i] = MAX;
    }
    distant[start] = 0;
    int last_point[N] = {0};
    queue* qu_t = (queue*)malloc(sizeof(queue));
    qu_t->data = start;
    qu_t->next = NULL;
    while(!is_empty_queue(qu_t)){
        for(int i = 0;i < N;i++){
            if(t->side[read_queue(qu_t)][i]){
                int a = distant[read_queue(qu_t)] + t->side[read_queue(qu_t)][i];
                if(a < distant[i]){
                    distant[i] = a;
                    last_point[i] = read_queue(qu_t);
                    enqueue(&qu_t, i);
                }
            }
        }
        dequeue(&qu_t);
    }
    int ptr = end;
    while(ptr != start){
        cout << ptr << " <- ";
        ptr = last_point[ptr];
    }
    cout << start;
}

int main(){
    map map_0;
    map_0.drop[0][0] = 'a';
    map_0.drop[1][0] = 'b';
    map_0.drop[2][0] = 'c';
    map_0.drop[3][0] = 'd';
    map_0.drop[4][0] = 'e';
    map_0.drop[5][0] = 'f';
    map_0.side[0][3] = 1;
    map_0.side[0][2] = 1;
    map_0.side[0][4] = 1;
    map_0.side[2][3] = 1;
    map_0.side[1][5] = 1;
    map_0.side[2][1] = 1;
    map_0.side[3][0] = 1;
    map_0.side[3][5] = 5;
    map_0.side[4][5] = 1;
    breadthFirstSearch(&map_0, 0, 5);
    return 0;
}