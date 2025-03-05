#include <iostream>
#include <vector>
#include <stack>
#include <unordered_set>
#include <unordered_map>
#include <cmath>
#include <algorithm>
#include <random>

using namespace std;

template<class key_type, class value_type>class FibHeap {
    // 斐波那契堆节点定义
    class FibNode {
    public:
        key_type key;        // 节点键值（路径长度）
        value_type value;    // 节点存储的值（顶点索引）
        FibNode* left;       // 左兄弟节点（循环双向链表）
        FibNode* right;      // 右兄弟节点（循环双向链表）
        FibNode* parent;     // 父节点指针
        FibNode* child;      // 子节点指针
        bool mark;           // 标记位（用于级联剪切）
        int degree;          // 子节点数量

        FibNode(key_type key = key_type(), value_type value = value_type(),
            FibNode* left = nullptr, FibNode* right = nullptr)
            :key(key), value(value), left(left), right(right),
            parent(nullptr), child(nullptr), mark(false), degree(0) {
            ;
        }
    };

    int size;        // 堆中节点总数
    int n_roots;     // 根链表节点数
    FibNode* min;    // 当前最小节点指针
    std::unordered_map<value_type, FibNode*> hashtable; // 值到节点的哈希映射

public:
    FibHeap() : size(0), n_roots(0), min(NULL) {}

    // 堆是否为空判断
    bool empty() { return min == NULL; }

    // 获取最小节点存储的值（顶点索引）
    value_type get_min() { return min->value; }

private:
    // 将节点追加到循环双向链表中
    void __append(FibNode*& head, FibNode* node) {
        if (head == NULL) {  // 空链表初始化
            head = node;
            head->left = head;
            head->right = head;
        }
        else {  // 插入到链表尾部
            node->left = head->left;
            node->right = head;
            node->left->right = node;
            node->right->left = node;
        }
    }

public:
    // 插入新节点到堆中
    void insert(key_type key, value_type value) {
        __append(min, new FibNode(key, value));  // 创建新节点并插入根链表
        hashtable[value] = min->left;            // 更新哈希表
        if (min->left->key < min->key)           // 更新最小值指针
            min = min->left;
        size++;
        n_roots++;
    }

private:
    // 合并两个堆树，返回合并后的根节点
    FibNode* __merge(FibNode* a, FibNode* b) {
        // 确保a是较小根
        if (a->key > b->key) {
            FibNode* tmp = a;
            a = b;
            b = tmp;
        }
        // 将b作为a的子节点
        if (a->child == nullptr) {  // a没有子节点的情况
            a->child = b;
            b->left = b;
            b->right = b;
            b->parent = a;
        }
        else { // 插入到子链表尾部
            b->left = a->child->left;
            b->right = a->child;
            b->left->right = b;
            b->right->left = b;
            b->parent = a;
        }
        a->degree++; // 更新度数
        return a;
    }

    // 合并相同度数的堆树（维护堆性质）
    void __insert(std::unordered_map<int, FibNode*>& roots, FibNode* node) {
        int deg = node->degree;
        if (roots[deg] == nullptr)
            roots[deg] = node;
        else {
            __insert(roots, __merge(node, roots[deg]));
            roots[deg] = nullptr;
        }
    }

public:
    // 提取最小节点（核心操作）
    void extract_min() {
        if (min == nullptr)
            return;

        // 将最小节点的子节点提升到根链表
        for (FibNode* cur = min->child; min->degree != 0; min->degree--) {
            FibNode* tmp = cur->right;
            cur->right = cur->right->right;
            __append(min, tmp); // 插入子节点到根链表
            tmp->parent = nullptr;
            n_roots++;
        }

        // 移除最小节点
        hashtable.erase(min->value);
        min->left->right = min->right;
        min->right->left = min->left;

        FibNode* old_min = min; // 更新临时min指针
        min = min->left;
        if (min == old_min)
            min = nullptr;
        delete old_min;
        size--;
        n_roots--;

        // 合并相同度数的堆树
        std::unordered_map<int, FibNode*>roots;
        for (FibNode* cur = min; n_roots != 0; n_roots--) {
            FibNode* tmp = cur;
            cur = cur->right;
            __insert(roots, tmp);
        }

        // 重建根链表并找到新最小值
        min = nullptr;
        for (auto root : roots) {
            if (root.second != nullptr) {
                __append(min, root.second);
                if (min->left->key < min->key)
                    min = min->left;
                n_roots++;
            }
        }
    }

private:
    // 级联剪切操作（维护堆性质）
    void cut_out(FibNode* node) {
        __append(min, node);    // 提升节点到根链表
        node->mark = false;     // 重置标记

        if (min->left->key < min->key)
            min = min->left;
        n_roots++;
        if (node->parent->mark == false)
            node->parent->mark = true;  // 标记父节点
        else
            cut_out(node->parent);      // 递归剪切
        node->parent = nullptr;
    }

public:
    // 减少节点键值（Dijkstra算法关键操作）
    void decrease_key(value_type value, key_type new_key) {
        FibNode* target = hashtable[value];
        if (target == nullptr) {    // 处理未找到的情况
            insert(new_key, value);
            return;
        }
        // 减小 key 值
        if (new_key < target->key) {
            target->key = new_key;
            // 如果没有破坏堆属性, 则跳出
            if (target->parent == nullptr || target->parent->key < target->key)
                return;
            // 调用 cut_out 递归地调整堆属性
            cut_out(target);
        }
    }
};

// 节点结构体
struct Node {
    int x, y;       // 节点坐标
    int g;          // 实际代价
    int h;          // 预估代价
    Node* parent;   // 父节点指针

    Node(int x, int y) : x(x), y(y), g(0), h(0), parent(nullptr) {}

    // 计算总代价
    int f() const { return g + h; }
};

// 哈希函数用于unordered_set
struct NodeHash {
    size_t operator()(const Node* node) const {
        return hash<int>()(node->x) ^ hash<int>()(node->y);
    }
};

// 判断节点是否相等
struct NodeEqual {
    bool operator()(const Node* a, const Node* b) const {
        return a->x == b->x && a->y == b->y;
    }
};

// A*算法实现
vector<pair<int, int>> aStar(const vector<vector<int>>& grid,
    pair<int, int> start,
    pair<int, int> end) {
    if (grid[start.first][start.second] == 1)
        return {};
    // 方向数组（上，下，左，右）
    const int dir[4][2] = { {-1,0}, {1,0}, {0,-1}, {0,1} };

    // 优先队列（开放列表）
    FibHeap<int, Node*> openList;
    // 关闭列表
    unordered_set<Node*, NodeHash, NodeEqual> closedList;

    // 创建起点节点
    Node* startNode = new Node(start.first, start.second);
    openList.insert(startNode->f(), startNode);

    while (!openList.empty()) {
        // 取出优先级最高的节点
        Node* current = openList.get_min();
        //cout << current->x << ' ' << current->y << ' ' << current->g << ' ' << current->h << ' ' << current->f() << '\n';
        openList.extract_min();

        // 到达终点
        if (current->x == end.first && current->y == end.second) {
            // 回溯路径
            vector<pair<int, int>> path;
            while (current) {
                path.emplace_back(current->x, current->y);
                current = current->parent;
            }
            reverse(path.begin(), path.end());
            return path;
        }

        closedList.insert(current);

        // 生成相邻节点
        for (int i = 0; i < 4; ++i) {
            int newX = current->x + dir[i][0];
            int newY = current->y + dir[i][1];

            // 检查边界和障碍物
            if (newX < 0 || newX >= grid.size() ||
                newY < 0 || newY >= grid[0].size() ||
                grid[newX][newY] == 1) {
                continue;
            }

            // 创建新节点
            Node* neighbor = new Node(newX, newY);
            neighbor->parent = current;
            neighbor->g = current->g + 1;
            // 使用曼哈顿距离作为启发函数
            neighbor->h = (abs(end.first - newX) + abs(end.second - newY));

            // 检查是否在关闭列表
            if (closedList.find(neighbor) != closedList.end()) {
                delete neighbor;
                continue;
            }

            // 更新开放列表
            openList.decrease_key(neighbor, neighbor->f());
        }
    }

    return {}; // 没有找到路径
}

// 生成迷宫地图
vector<vector<int>> generateMaze(int width, int height) {
    const int dir[4][2] = { {-1, 0}, {0, 1}, {1, 0}, {0, -1} };
    // 初始化地图（1 表示墙，0 表示路径）
    vector<vector<int>> grid(height, vector<int>(width, 1));

    // 随机数生成器
    random_device rd;
    mt19937 gen(rd());

    // 从起点开始生成迷宫
    stack<pair<int, int>> stack;
    int startX = 1, startY = 1;
    grid[startX][startY] = 0;
    stack.push({ startX, startY });

    while (!stack.empty()) {
        auto current = stack.top();
        int x = current.first, y = current.second;

        // 随机打乱方向
        vector<int> directions = { 0, 1, 2, 3 };
        shuffle(directions.begin(), directions.end(), gen);

        bool found = false;
        for (int d : directions) {
            int nx = x + dir[d][0] * 2;
            int ny = y + dir[d][1] * 2;

            if (nx >= 0 && nx < height && ny >= 0 && ny < width && grid[nx][ny] == 1) {
                grid[nx][ny] = 0; // 打通新路径
                grid[x + dir[d][0]][y + dir[d][1]] = 0; // 打通中间的墙
                stack.push({ nx, ny });
                found = true;
                break;
            }
        }

        if (!found) {
            stack.pop(); // 回溯
        }
    }

    return grid;
}

// 打印地图和路径
void printMap(const vector<vector<int>>& grid, const vector<pair<int, int>>& path) {
    for (int i = 0; i < grid.size(); ++i) {
        for (int j = 0; j < grid[i].size(); ++j) {
            if (find(path.begin(), path.end(), make_pair(i, j)) != path.end()) {
                cout << "::"; // 路径
            }
            else if (grid[i][j] == 1) {
                cout << "██"; // 障碍物
            }
            else {
                cout << "  "; // 空地
            }
        }
        cout << endl;
    }
}

int main() {
    // 地图大小
    const int width = 21;
    const int height = 21;

    // 生成随机迷宫
    vector<vector<int>> grid = generateMaze(width, height);

    // 设置起点和终点
    pair<int, int> start = { 1, 1 };
    pair<int, int> end = { height - 2, width - 2 };

    // 运行 A* 算法
    vector<pair<int, int>> path = aStar(grid, start, end);

    // 输出结果
    if (path.empty()) {
        cout << "路径不存在" << endl;
    }
    else {
        cout << "找到路径：" << endl;
    }
    printMap(grid, path);
    return 0;
}