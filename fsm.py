from graphviz import Digraph

import os
os.environ["PATH"] += os.pathsep + 'C:/Program Files/Graphviz/bin/'

dot = Digraph(name='FSM-Diagram', format="png")

dot.node('A', label = 'new_user')
dot.node('B', label = 'user')
dot.node('C', label = 'select_point')
dot.node('D', label = '1st_guess')
dot.node('E', label = '2nd_guess')
dot.node('F', label = '3rd_guess')
dot.node('G', label = '4th_guess')
dot.node('H', label = '5th_guess')

dot.edge('A', 'B', label='advance [is_going_to_user]')
dot.edge('B', 'C', label='advance [is_going_to_select_point]')
dot.edge('C', 'D', label='advance [is_going_to_1st_guess]')
dot.edge('D', 'E', label='advance [is_going_to_2nd_guess]')
dot.edge('E', 'F', label='advance [is_going_to_3rd_guess]')
dot.edge('F', 'G', label='advance [is_going_to_4th_guess]')
dot.edge('G', 'H', label='advance [is_going_to_5th_guess]')
dot.edge('D', 'B', label='go_back')
dot.edge('E', 'B', label='go_back')
dot.edge('F', 'B', label='go_back')
dot.edge('G', 'B', label='go_back')
dot.edge('H', 'B', label='go_back')


dot.render('./FSM-Diagram', view=True)