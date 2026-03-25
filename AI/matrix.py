import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import numpy as np

# 1. DATA
students = [
    "Dhruvahuja", "Hardik", "Ekansh", "Divij", "Divyansh", 
    "Gm", "Kanika", "Komal", "Kh", "Kk", "Kartikay", 
    "Harish", "Ishu", "Keshav", "Gautam", "Imran", 
    "Student", "Himanshu", "Syuni", "Kanishk"
]

# 2. SCENARIO
y_true = students.copy()
y_pred = students.copy()

# 3. GENERATE MATRIX
cm = confusion_matrix(y_true, y_pred, labels=students)

# 4. PLOT (Adjusted for No Overlap)
# Increase width to 12 to give more room for x-labels
plt.figure(figsize=(12, 10)) 

ax = sns.heatmap(cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues', 
            xticklabels=students, 
            yticklabels=students,
            cbar=True,
            square=True,
            linewidths=0.5,
            linecolor='white',
            annot_kws={"size": 9}) # Slightly larger numbers

# 5. FIXED LABELS
plt.xlabel('Predicted Class', fontsize=12, labelpad=10)
plt.ylabel('True Class', fontsize=12, labelpad=10)
plt.title('Confusion Matrix', fontsize=16, pad=20)

# KEY FIX: Rotate both axes and align them correctly
plt.xticks(rotation=45, ha='right', fontsize=10) # 45 degrees is easier to read than 90
plt.yticks(rotation=0, fontsize=10)

plt.figtext(0.5, 0.01, "Fig. 1. Confusion matrix for Face Recognition Pipeline", 
            wrap=True, horizontalalignment='center', fontsize=12)

# 6. SHOW
plt.tight_layout() # This automatically fixes margin overlap
plt.subplots_adjust(bottom=0.2) # Extra bottom margin for the caption
plt.show()
