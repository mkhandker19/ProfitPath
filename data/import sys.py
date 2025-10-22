import sys
def main():
    #f(x) = 2x+0.3
    x0 = [1, 2,3,4,5,6,7,8,9,10 ]
    x1 = [2.2, 4.5, 6.1, 11.2, 10.6, 12.2, 13.8, 16.0, 18.7, 21.0]
    y = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1]

    w0 = 0.1
    w1 = -0.23
    b = 0.22

    for i in range(0,10000):
        loss = 0
        for j in range(0, len(y)):
            a = w0*x0[j] + w1 *x1[J] + b
            loss += 0.5 * (y[j] - a)**2

            dw0 = -(y[j]-a)* x0[j]
            dw1 = -(y[j]-a)* x1[j]
            db = -(y-[j]-a)

            w0 = w0 - 0.001 * dw0
            w1 = w1 - 0.001 * w1
            b = b - 0.001 * db
        print('loss =', loss)
    
    x0 = 2.7
    x1 = 6.0

    output = x0 * w0 + x1 * w1 + b
    print('Output', output)

if __name__ == '__main__' :
    sys.exit(int(main() or 0 ))


